import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Download, Share2, ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';
import {
  captureCrashReport,
  CrashReport,
  downloadCrashReportFile,
  shareCrashReportData,
  getLatestCrashReport
} from '../utils/crashReportSystem';
import { t } from '../utils/localizationSystem';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  report: CrashReport | null;
  showDetails: boolean;
  toastMsg: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    report: null,
    showDetails: false,
    toastMsg: null,
  };

  private static isBenignError(error: any): boolean {
    if (!error) return true;
    const msg = `${error?.message || ''} ${String(error || '')}`.toLowerCase();
    return (
      msg.includes('script error') ||
      msg.includes('resizeobserver loop') ||
      msg.includes('non-error promise rejection') ||
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('websocket')
    );
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    try {
      const report = captureCrashReport(error, 'React Component Tree', true);
      this.setState({ report });
    } catch (e) {
      console.warn('Error during captureCrashReport:', e);
    }
  }

  private handleRecover = () => {
    // Attempt smooth state recovery without clearing player's saved state
    this.setState({ hasError: false, error: null, report: null });
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  private handleDownload = () => {
    const activeReport = this.state.report || getLatestCrashReport();
    if (activeReport) {
      downloadCrashReportFile(activeReport, 'txt');
      this.showToast(t('CRASH_COPIED') || 'Report downloaded');
    }
  };

  private handleShare = async () => {
    const activeReport = this.state.report || getLatestCrashReport();
    if (activeReport) {
      const res = await shareCrashReportData(activeReport);
      if (res.shared) {
        this.showToast('Report shared successfully');
      } else if (res.copied) {
        this.showToast(t('CRASH_COPIED') || 'Report copied to clipboard!');
      }
    }
  };

  private showToast = (msg: string) => {
    this.setState({ toastMsg: msg });
    setTimeout(() => this.setState({ toastMsg: null }), 3000);
  };

  public render() {
    if (this.state.hasError) {
      const activeReport = this.state.report || getLatestCrashReport();

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 select-none">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            {/* Top Warning Badge */}
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-950/50 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                {t('CRASH_AUTO_DETECTED')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('CRASH_TITLE')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {t('CRASH_RECOVERY_MSG')}
              </p>
            </div>

            {/* Feedback Toast */}
            {this.state.toastMsg && (
              <div className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                {this.state.toastMsg}
              </div>
            )}

            {/* Diagnostic Snapshot Box */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-left space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  {t('CRASH_ERR_TYPE')}: {activeReport?.errorType || 'Runtime Error'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeReport?.timestamp ? new Date(activeReport.timestamp).toLocaleTimeString() : 'Now'}
                </span>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl font-mono text-[11px] text-red-300 break-words">
                {this.state.error?.message || String(this.state.error) || 'An unexpected runtime error occurred.'}
              </div>

              {/* Collapsible details */}
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                {t('CRASH_DETAILS_TOGGLE')}
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && activeReport?.stackTrace && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {activeReport.stackTrace}
                </div>
              )}
            </div>

            {/* Recovery & Action Controls */}
            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleRecover}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                {t('CRASH_RECOVER_BTN')}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleDownload}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  {t('CRASH_DOWNLOAD_BTN')}
                </button>

                <button
                  onClick={this.handleShare}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  {t('CRASH_SHARE_BTN')}
                </button>
              </div>

              <button
                onClick={this.handleHardReload}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline transition cursor-pointer pt-1 block mx-auto"
              >
                Reload Page Entirely
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
