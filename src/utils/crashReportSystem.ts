import { saveCareerToAutosaveSlot, UniqueCareerSaveState } from './careerSaveSystem';
import { safeSetItem, safeGetItem, safeDownloadBlob } from './storageCleaner';

export interface CrashReport {
  id: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  currentScreen: string;
  gameMode: string;
  lastAction: string;
  affectedSystem: string;
  timestamp: string;
  occurrenceCount: number;
  isAutomatic: boolean;
  careerState?: {
    playerName?: string;
    club?: string;
    position?: string;
    ovr?: number;
    age?: number;
    marketValue?: number;
    seasonIndex?: number;
    isRetired?: boolean;
    savedAt?: string;
  };
  extraData?: Record<string, any>;
}

export interface CrashContext {
  currentScreen: string;
  gameMode: string;
  lastAction: string;
  affectedSystem: string;
  careerState?: CrashReport['careerState'];
  extraData?: Record<string, any>;
}

const LOCAL_STORAGE_CRASH_REPORTS_KEY = 'FOOTBALL_CAREER_CRASH_REPORTS_V1';

let activeCrashContext: CrashContext = {
  currentScreen: 'Main Menu',
  gameMode: 'Main Menu',
  lastAction: 'Game Engine Initialised',
  affectedSystem: 'System Core',
};

let inMemoryReports: CrashReport[] = [];

// Try to initialize from LocalStorage
try {
  const saved = safeGetItem(LOCAL_STORAGE_CRASH_REPORTS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      inMemoryReports = parsed.filter(
        (r) => r && r.errorMessage && r.errorMessage !== 'Script error.'
      );
    }
  }
} catch (e) {
  console.warn('Could not read stored crash reports:', e);
}

type CrashReportListener = (reports: CrashReport[]) => void;
const listeners: Set<CrashReportListener> = new Set();

function notifyListeners(): void {
  listeners.forEach((fn) => fn([...inMemoryReports]));
}

function persistReports(): void {
  try {
    const compactReports = inMemoryReports.slice(0, 5).map((r) => ({
      ...r,
      stackTrace: r.stackTrace ? r.stackTrace.slice(0, 300) : undefined,
    }));
    safeSetItem(LOCAL_STORAGE_CRASH_REPORTS_KEY, JSON.stringify(compactReports));
  } catch (e) {
    console.warn('Failed to save crash reports:', e);
  }
}

export function subscribeCrashReports(listener: CrashReportListener): () => void {
  listeners.add(listener);
  listener([...inMemoryReports]);
  return () => {
    listeners.delete(listener);
  };
}

export function setCrashContext(ctx: Partial<CrashContext>): void {
  activeCrashContext = {
    ...activeCrashContext,
    ...ctx,
  };
}

export function recordLastAction(actionName: string, systemName?: string): void {
  activeCrashContext.lastAction = actionName;
  if (systemName) {
    activeCrashContext.affectedSystem = systemName;
  }
}

export function captureCrashReport(
  error: Error | string | any,
  affectedSystem?: string,
  isAuto = true,
  emergencyStateToPreserve?: any
): CrashReport {
  let errType = 'Runtime Error';
  let errMessage = 'An unexpected runtime anomaly occurred.';
  let stackTrace: string | undefined = undefined;

  if (error instanceof Error) {
    errType = error.name || 'JavaScript Error';
    errMessage = error.message || String(error);
    stackTrace = error.stack;
  } else if (typeof error === 'string') {
    errMessage = error;
  } else if (error && typeof error === 'object') {
    errType = error.type || 'System Exception';
    errMessage = error.message || JSON.stringify(error);
  }

  const isScriptErr =
    !errMessage ||
    errMessage.toLowerCase().includes('script error') ||
    errMessage.toLowerCase().includes('resizeobserver') ||
    errMessage === 'Window Global Error';

  if (isScriptErr) {
    // Suppress empty cross-origin script error events
    return inMemoryReports[0] || {
      id: 'suppressed_script_error',
      errorType: 'Script error',
      errorMessage: 'Benign cross-origin script error suppressed',
      currentScreen: 'Runtime',
      gameMode: 'System',
      affectedSystem: 'Browser Window',
      lastAction: 'System Event',
      timestamp: new Date().toISOString(),
      occurrenceCount: 1,
      isAutomatic: true,
    };
  }

  const sys = affectedSystem || activeCrashContext.affectedSystem || 'Application Runtime';
  const screen = activeCrashContext.currentScreen || 'Unknown View';
  const mode = activeCrashContext.gameMode || 'Career Mode';

  // Attempt to deduplicate by checking if identical error & screen exists
  const existingIdx = inMemoryReports.findIndex(
    (r) => r.errorMessage === errMessage && r.currentScreen === screen && r.errorType === errType
  );

  let targetReport: CrashReport;

  if (existingIdx >= 0) {
    // Group identical errors and increment count
    inMemoryReports[existingIdx].occurrenceCount += 1;
    inMemoryReports[existingIdx].timestamp = new Date().toISOString();
    inMemoryReports[existingIdx].lastAction = activeCrashContext.lastAction;
    if (stackTrace) inMemoryReports[existingIdx].stackTrace = stackTrace;
    targetReport = inMemoryReports[existingIdx];
    // Move to top of array
    inMemoryReports.unshift(inMemoryReports.splice(existingIdx, 1)[0]);
  } else {
    targetReport = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      errorType: errType,
      errorMessage: errMessage,
      stackTrace,
      currentScreen: screen,
      gameMode: mode,
      lastAction: activeCrashContext.lastAction,
      affectedSystem: sys,
      timestamp: new Date().toISOString(),
      occurrenceCount: 1,
      isAutomatic: isAuto,
      careerState: activeCrashContext.careerState,
      extraData: activeCrashContext.extraData,
    };
    inMemoryReports.unshift(targetReport);
  }

  persistReports();
  notifyListeners();

  // Attempt emergency state preservation if provided
  if (emergencyStateToPreserve) {
    try {
      saveCareerToAutosaveSlot(emergencyStateToPreserve);
    } catch (e) {
      console.warn('Emergency autosave during crash report failed:', e);
    }
  }

  return targetReport;
}

export function getCrashReports(): CrashReport[] {
  return [...inMemoryReports];
}

export function getLatestCrashReport(): CrashReport | null {
  return inMemoryReports.length > 0 ? inMemoryReports[0] : null;
}

export function clearCrashReports(): void {
  inMemoryReports = [];
  persistReports();
  notifyListeners();
}

/**
 * Downloads a readable txt or json diagnostic report file
 */
export function downloadCrashReportFile(report: CrashReport, format: 'txt' | 'json' = 'txt'): void {
  const timestampStr = new Date(report.timestamp).toISOString().replace(/[:.]/g, '-');
  const filename = `crash_report_${timestampStr}.${format}`;

  let content = '';
  if (format === 'json') {
    content = JSON.stringify(report, null, 2);
  } else {
    content = `=====================================================
BECOME A LEGEND: REMADE - SYSTEM DIAGNOSTIC REPORT
=====================================================
Timestamp: ${report.timestamp}
Report ID: ${report.id}
Error Type: ${report.errorType}
Occurrences: ${report.occurrenceCount}
Automatic Detection: ${report.isAutomatic ? 'YES' : 'NO'}

-----------------------------------------------------
CONTEXT & ENVIRONMENT
-----------------------------------------------------
Current Screen: ${report.currentScreen}
Game Mode: ${report.gameMode}
Affected System: ${report.affectedSystem}
Last Player Action: ${report.lastAction}

-----------------------------------------------------
CAREER / SEASON STATE
-----------------------------------------------------
Player Name: ${report.careerState?.playerName || 'N/A'}
Current Club: ${report.careerState?.club || 'N/A'}
Position: ${report.careerState?.position || 'N/A'}
Overall Rating (OVR): ${report.careerState?.ovr ?? 'N/A'}
Age: ${report.careerState?.age ?? 'N/A'}
Market Value: ${report.careerState?.marketValue ? `€${report.careerState.marketValue.toLocaleString()}` : 'N/A'}
Season Index: ${report.careerState?.seasonIndex ?? 'N/A'}
Retired Status: ${report.careerState?.isRetired ? 'YES' : 'NO'}

-----------------------------------------------------
ERROR DETAILS
-----------------------------------------------------
Message: ${report.errorMessage}

-----------------------------------------------------
STACK TRACE
-----------------------------------------------------
${report.stackTrace || 'No stack trace available.'}

=====================================================
End of Diagnostic Log
=====================================================`;
  }

  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
  safeDownloadBlob(blob, filename, {
    shareTitle: `Diagnostic Log - ${filename}`,
    shareText: `Crash Diagnostic Report: ${report.errorType}`,
  }).catch(() => {});
}

/**
 * Shares the report using navigator.share or copies formatted summary to clipboard
 */
export async function shareCrashReportData(report: CrashReport): Promise<{ shared: boolean; copied: boolean }> {
  const textSummary = `[BECOME A LEGEND BUG REPORT]
Error: ${report.errorType} - ${report.errorMessage}
Screen: ${report.currentScreen} (${report.gameMode})
Action: ${report.lastAction}
System: ${report.affectedSystem}
Player: ${report.careerState?.playerName || 'N/A'} (${report.careerState?.club || 'Free Agent'})
Time: ${report.timestamp}
Occurrences: ${report.occurrenceCount}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Become A Legend - Bug Report (${report.errorType})`,
        text: textSummary,
      });
      return { shared: true, copied: false };
    } catch (e) {
      // User cancelled share or share failed; fallback to clipboard
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(textSummary);
      return { shared: false, copied: true };
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  }

  return { shared: false, copied: false };
}

// Global window error listener setup
let isGlobalListenerSetup = false;

const isScriptOrCrossDomainError = (msg: any, err?: any): boolean => {
  if (!msg && !err) return true;
  const combined = `${msg || ''} ${err?.message || ''} ${String(err || '')}`.toLowerCase();
  return (
    combined.includes('script error') ||
    combined.includes('resizeobserver loop') ||
    combined.includes('non-error promise rejection') ||
    combined.includes('failed to fetch dynamically imported module') ||
    combined.includes('websocket')
  );
};

export function setupGlobalErrorListeners(): void {
  if (isGlobalListenerSetup || typeof window === 'undefined') return;
  isGlobalListenerSetup = true;

  // 1. window.onerror returns true to suppress generic browser cross-origin script error events
  try {
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
      if (isScriptOrCrossDomainError(message, error)) {
        return true; // Prevents bubbling to browser crash handler
      }
      try {
        captureCrashReport(error || message || 'Window Runtime Error', 'Browser Runtime', true);
      } catch {}
      if (typeof originalOnError === 'function') {
        try {
          originalOnError.apply(this, arguments as any);
        } catch {}
      }
      return true; // Handled gracefully, prevent unhandled window script error
    };
  } catch {}

  // 2. Event listener capturing phase
  window.addEventListener(
    'error',
    (event) => {
      try {
        if (!event) return;
        if (event.preventDefault) event.preventDefault();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        if (isScriptOrCrossDomainError(event.message, event.error)) {
          return;
        }
        if (event.error) {
          captureCrashReport(event.error, 'Browser Runtime', true);
        }
      } catch {}
    },
    true
  );

  // 3. Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    try {
      if (!event) return;
      if (event.preventDefault) event.preventDefault();
      if (isScriptOrCrossDomainError(event.reason)) {
        return;
      }
      if (event.reason) {
        captureCrashReport(event.reason, 'Async Promise Engine', true);
      }
    } catch {}
  });
}

// Auto-run on module evaluation
try {
  if (typeof window !== 'undefined') {
    setupGlobalErrorListeners();
  }
} catch {}
