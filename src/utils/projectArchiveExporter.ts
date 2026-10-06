import JSZip from 'jszip';
import fileSaver from 'file-saver';
const saveAs = (fileSaver as any)?.saveAs || fileSaver;

export interface ExportProgressCallback {
  (step: string, percentage: number): void;
}

/**
 * Collects all game saves and option file data from localStorage
 */
export function collectAllGameSaveData(): Record<string, any> {
  const saveState: Record<string, any> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        try {
          saveState[key] = val ? JSON.parse(val) : val;
        } catch {
          saveState[key] = val;
        }
      }
    }
  } catch (err) {
    console.error('Error reading localStorage for export:', err);
  }
  return saveState;
}

/**
 * Restores all game saves from an exported JSON object
 */
export function restoreGameSaveData(saveData: Record<string, any>): number {
  let count = 0;
  try {
    const targetData = saveData && typeof saveData === 'object' && saveData.saves ? saveData.saves : saveData;

    Object.entries(targetData).forEach(([key, val]) => {
      if (key.startsWith('_')) return; // skip metadata
      if (typeof val === 'object' && val !== null) {
        localStorage.setItem(key, JSON.stringify(val));
      } else if (val !== undefined && val !== null) {
        localStorage.setItem(key, String(val));
      }
      count++;
    });
  } catch (err) {
    console.error('Error restoring save data:', err);
  }
  return count;
}

const WINDOWS_BAT_CONTENT = `@echo off
setlocal
cd /d "%~dp0"
title DrawStar: Unique Career - Offline Desktop Edition
echo ========================================================
echo       DRAWSTAR 32-BIT - OFFLINE STANDALONE RUNNER
echo ========================================================
echo.
echo Starting local offline game server on port 3030...
echo [!] Keep this window open while playing. Close it when done.
echo.

:: 1. Check Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Detected Python. Starting instant server...
    start "" "http://localhost:3030/index.html"
    python -m http.server 3030
    goto :done
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Detected Python3. Starting instant server...
    start "" "http://localhost:3030/index.html"
    python3 -m http.server 3030
    goto :done
)

:: 2. PowerShell Native HttpListener (100% built into Windows 10 & 11)
echo [OK] Starting Windows built-in local web server...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = 3030;" ^
  "$server = [System.Net.HttpListener]::new();" ^
  "$server.Prefixes.Add('http://localhost:' + $port + '/');" ^
  "try { $server.Start() } catch { $port = 3031; $server = [System.Net.HttpListener]::new(); $server.Prefixes.Add('http://localhost:' + $port + '/'); $server.Start() };" ^
  "Write-Host ('[OK] Running offline at: http://localhost:' + $port + '/index.html');" ^
  "Start-Process ('http://localhost:' + $port + '/index.html');" ^
  "$root = (Get-Location).Path;" ^
  "while ($server.IsListening) {" ^
  "  $ctx = $server.GetContext();" ^
  "  $req = $ctx.Request.Url.LocalPath.TrimStart('/');" ^
  "  if ([string]::IsNullOrEmpty($req)) { $req = 'index.html' };" ^
  "  $f = Join-Path $root $req;" ^
  "  if (-not (Test-Path $f -PathType Leaf)) { $f = Join-Path $root 'index.html' };" ^
  "  $ext = [System.IO.Path]::GetExtension($f).ToLower();" ^
  "  $mime = switch ($ext) {" ^
  "    '.html' { 'text/html; charset=utf-8' }" ^
  "    '.js'   { 'application/javascript; charset=utf-8' }" ^
  "    '.mjs'  { 'application/javascript; charset=utf-8' }" ^
  "    '.css'  { 'text/css; charset=utf-8' }" ^
  "    '.json' { 'application/json; charset=utf-8' }" ^
  "    '.svg'  { 'image/svg+xml' }" ^
  "    '.png'  { 'image/png' }" ^
  "    '.jpg'  { 'image/jpeg' }" ^
  "    '.jpeg' { 'image/jpeg' }" ^
  "    '.ico'  { 'image/x-icon' }" ^
  "    default { 'text/plain; charset=utf-8' }" ^
  "  };" ^
  "  $bytes = [System.IO.File]::ReadAllBytes($f);" ^
  "  $ctx.Response.StatusCode = 200;" ^
  "  $ctx.Response.ContentType = $mime;" ^
  "  $ctx.Response.ContentLength64 = $bytes.Length;" ^
  "  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length);" ^
  "  $ctx.Response.Close();" ^
  "}"

:done
pause
`;

const LINUX_SH_CONTENT = `#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "Starting DrawStar Offline Desktop..."
start_browser() {
  sleep 1
  xdg-open "http://localhost:3030/index.html" 2>/dev/null || open "http://localhost:3030/index.html" 2>/dev/null
}
start_browser &
python3 -m http.server 3030 || python -m http.server 3030
`;

/**
 * STANDALONE OFFLINE DESKTOP BUNDLE (.ZIP WITH REAL GAME + 1-CLICK BAT RUNNER)
 * Zero internet connection or CLI installations required.
 */
export async function downloadCompleteGameZip(onProgress?: ExportProgressCallback): Promise<void> {
  const zip = new JSZip();

  if (onProgress) onProgress('Collecting current game index...', 15);

  let indexHtml = '';
  try {
    const res = await fetch('./index.html?v=' + Date.now());
    if (res.ok) {
      indexHtml = await res.text();
      zip.file('index.html', indexHtml);
    }
  } catch (err) {
    console.warn('Could not fetch index.html directly:', err);
  }

  // Scrape assets from HTML
  const assetPaths: string[] = [
    'manifest.webmanifest',
    'registerSW.js',
    'pwa-192x192.png',
    'pwa-512x512.png',
  ];

  if (indexHtml) {
    const matches = indexHtml.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|png|jpg|jpeg|svg|ico|webmanifest))["']/g);
    for (const match of matches) {
      const raw = match[1];
      if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
        const clean = raw.startsWith('./') ? raw.slice(2) : raw.startsWith('/') ? raw.slice(1) : raw;
        assetPaths.push(clean);
      }
    }
  }

  const uniquePaths = Array.from(new Set(assetPaths));

  if (onProgress) onProgress('Bundling offline assets...', 35);

  let fetchedCount = 0;
  for (const asset of uniquePaths) {
    try {
      const res = await fetch('./' + asset);
      if (res.ok) {
        const blob = await res.blob();
        zip.file(asset, blob);
      }
    } catch {
      // Continue on optional asset
    }
    fetchedCount++;
    if (onProgress) {
      onProgress(
        `Packaging assets (${fetchedCount}/${uniquePaths.length})...`,
        35 + Math.round((fetchedCount / uniquePaths.length) * 40)
      );
    }
  }

  if (onProgress) onProgress('Saving career & option file snapshot...', 80);

  // Current user saves and option files
  const currentSaves = collectAllGameSaveData();
  const savesJson = JSON.stringify(currentSaves, null, 2);
  zip.file('saves/drawstar-current-career-and-options.json', savesJson);

  if (onProgress) onProgress('Creating zero-install Windows offline runner...', 90);

  // Add launchers (both windows.bat and Play-Windows.bat to guarantee 100% user discovery)
  zip.file('windows.bat', WINDOWS_BAT_CONTENT);
  zip.file('Play-Windows.bat', WINDOWS_BAT_CONTENT);
  zip.file('Play-Linux-Mac.sh', LINUX_SH_CONTENT);

  const readmeContent = `# DRAWSTAR 32-BIT - OFFLINE EDITION

## How to Play:
- **Windows:** Double-click **windows.bat** or **Play-Windows.bat**.
- **Mac / Linux:** Run **./Play-Linux-Mac.sh**.

No internet connection required. All saves are stored in your browser's local storage and backed up in saves/.
`;
  zip.file('README.txt', readmeContent);

  if (onProgress) onProgress('Generating final ZIP file...', 95);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `drawstar-32bit-offline-${new Date().toISOString().split('T')[0]}.zip`);

  if (onProgress) onProgress('Done! Enjoy DrawStar offline.', 100);
}
