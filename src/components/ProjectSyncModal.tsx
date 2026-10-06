import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Save,
  X,
  RefreshCw,
  FolderArchive,
  Copy,
  Check,
  Monitor,
  Cpu,
  BookOpen,
  Sparkles,
  Smartphone,
  CheckCircle,
  Info,
} from 'lucide-react';
import {
  downloadCompleteGameZip,
  collectAllGameSaveData,
  restoreGameSaveData,
} from '../utils/projectArchiveExporter';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProjectSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
}

export const ProjectSyncModal: React.FC<ProjectSyncModalProps> = ({
  isOpen,
  onClose,
  showToast = (msg) => console.log(msg),
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStep, setExportStep] = useState<string>('');
  const [exportPercent, setExportPercent] = useState<number>(0);
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [apkInstallSuccess, setApkInstallSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallApk = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setApkInstallSuccess(true);
        showToast('🎉 DrawStar Android WebAPK installed successfully!');
      }
    } else {
      setShowApkGuide((prev) => !prev);
    }
  };

  // Standalone Desktop Game (.ZIP with real compiled game + zero-install Windows runner)
  const handleDownloadDesktopZip = async () => {
    try {
      setIsExporting(true);
      setExportStep('Packaging offline desktop files...');
      setExportPercent(10);

      await downloadCompleteGameZip((step, pct) => {
        setExportStep(step);
        setExportPercent(pct);
      });

      showToast('✅ Saved offline desktop game (.ZIP)! Double-click Play-Windows.bat to play.');
    } catch (err) {
      console.error('Desktop zip export error:', err);
      showToast('❌ Failed to package offline zip.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportStep('');
        setExportPercent(0);
      }, 1000);
    }
  };

  const handleExportSaveOnly = () => {
    try {
      const data = collectAllGameSaveData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drawstar-career-save-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('💾 Career and option file saved successfully!');
    } catch {
      showToast('❌ Failed to export save file.');
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        const count = restoreGameSaveData(parsed);
        showToast(`✅ Successfully restored ${count} save entries! Reloading...`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error('Import error:', err);
        showToast('❌ Invalid JSON save file.');
      }
    };
    reader.readAsText(file);
  };

  const copyRemixPrompt = () => {
    const promptText = `[DIRECTIVE: DRAWSTAR PROJECT CONTINUATION]
- Source of truth: Existing implementation in /src is authoritative. Do not recreate systems from scratch or replace mechanics with generic stubs.
- Identity: Retro 32-bit football career-mode simulation with deep underlying mechanics (Youth Academy, Senior Career, Contracts, Transfers, Cards, Lifestyle, World Results).
- Separation: Unique Career Store (UniqueCareerStoreModal.tsx) != Card Store (CardStoreModal.tsx).
- World Simulation: WorldResultsModal.tsx is authoritative for world/league matches.
- Minimal-Diff: Modify ONLY what is explicitly requested. Preserve all working gameplay mechanics.`;

    navigator.clipboard.writeText(promptText).then(() => {
      setIsCopiedPrompt(true);
      showToast('📋 Copied ultra-compact AI Context prompt to clipboard!');
      setTimeout(() => setIsCopiedPrompt(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-amber-400 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-400/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-400 rounded-xl text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span>DOWNLOAD & SYNC CENTER</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Offline Desktop PC runner, AI Studio Remix context guide, and career save backups.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {/* SECTION 1: AI STUDIO REMIX PROMPT (TOKEN-OPTIMIZED CONTEXT) */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-indigo-950/50 to-slate-900/80 border-2 border-indigo-400/90 shadow-[0_0_20px_rgba(99,102,241,0.25)] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>FOR AI STUDIO REMIXING</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase">
                  AI Context Guide (Low-Token Prompt)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                  When you <strong>Remix</strong> this project into another account, paste this compact directive into your first prompt so the AI never gets lost and preserves all systems!
                </p>
              </div>

              <button
                type="button"
                onClick={copyRemixPrompt}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
              >
                {isCopiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedPrompt ? 'COPIED TO CLIPBOARD!' : 'COPY REMIX PROMPT'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/30 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-indigo-300 font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>What's inside this prompt & README.md:</span>
              </div>
              <p>• Defines existing <code className="text-amber-300">/src</code> as absolute Source of Truth.</p>
              <p>• Prohibits rebuilding working mechanics or replacing systems with generic stubs.</p>
              <p>• Strictly separates Unique Career Store vs Card Store.</p>
              <p>• Protects authoritative World Results simulation and 32-bit retro identity.</p>
            </div>
          </div>

          {/* SECTION 2: PLAY OFFLINE ON WINDOWS PC (.ZIP RUNNER) */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900/70 border-2 border-amber-500/80 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>STANDALONE DESKTOP PC EDITION</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase">
                  Download Offline Game (.ZIP)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                  Includes the complete compiled game and a 1-click <code className="text-amber-300">Play-Windows.bat</code> launcher that runs offline using Windows built-in tools. <strong>No Node.js or terminal required!</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadDesktopZip}
                disabled={isExporting}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isExporting
                    ? 'bg-amber-600/50 text-amber-200 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95'
                }`}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PACKAGING...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>DOWNLOAD GAME (.ZIP)</span>
                  </>
                )}
              </button>
            </div>

            {/* PROGRESS BAR */}
            {isExporting && (
              <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                  <span>{exportStep}</span>
                  <span className="font-black">{exportPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-amber-400/40 p-[1px]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-150"
                    style={{ width: `${exportPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2B: PLAY OFFLINE ON ANDROID (OFFLINE APK & WEBAPK) */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-emerald-950/40 to-slate-900/70 border-2 border-emerald-500/80 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ANDROID OFFLINE APK / WEBAPK</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase flex items-center gap-2">
                  <span>Offline Android App (APK)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    100% OFFLINE
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                  Install DrawStar directly onto your Android device as a standalone native app (WebAPK). Opens in full screen without browser bars, saves your career locally, and plays completely offline anytime!
                </p>
              </div>

              <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
                {isInstalled || apkInstallSuccess ? (
                  <div className="px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black font-mono text-xs uppercase flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>INSTALLED ON DEVICE</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallApk}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95"
                  >
                    <Smartphone className="w-4 h-4 text-slate-950" />
                    <span>INSTALL OFFLINE APK</span>
                    <Download className="w-4 h-4 text-slate-950" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowApkGuide((prev) => !prev)}
                  className="text-[11px] font-mono text-emerald-400/90 hover:text-emerald-300 underline text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showApkGuide ? 'Hide Installation Instructions' : 'How to install on Android'}</span>
                </button>
              </div>
            </div>

            {/* EXPANDABLE ANDROID APK INSTALL GUIDE */}
            {showApkGuide && (
              <div className="mt-4 p-3.5 bg-slate-950/80 rounded-xl border border-emerald-500/40 space-y-2.5 text-xs text-slate-300 animate-in fade-in">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase font-mono text-[11px]">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>How to Install Offline Standalone APK on Android:</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                    <span>Open DrawStar in Chrome or your favorite browser on your Android device.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                    <span>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                    <span>Android will generate a native <strong>WebAPK</strong> app icon on your home screen. Launch it anytime to play 100% offline!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SAVE & OPTION FILE BACKUP ONLY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* EXPORT SAVE ONLY */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>EXPORT SAVE ONLY (.JSON)</span>
                </h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Exports your active career character, trophies, and custom option file edits without the code.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportSaveOnly}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center"
              >
                Save JSON File
              </button>
            </div>

            {/* RESTORE JSON FILE */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>RESTORE SAVE (.JSON)</span>
                </h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upload a previously exported career save file to restore your character and option files.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJsonFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-sky-950 hover:bg-sky-900 border border-sky-600 text-sky-200 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center"
                >
                  Upload Save File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            ★ DrawStar Engine: Retro 32-Bit Presentation & Deep Career Mechanics ★
          </p>
        </div>
      </div>
    </div>
  );
};
