import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  CrashReport,
  downloadCrashReportFile,
  shareCrashReportData,
  clearCrashReports
} from '../utils/crashReportSystem';

interface CrashReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CrashReport | null;
  allReports?: CrashReport[];
  onRecover?: () => void;
  isAutomaticCrash?: boolean;
}

export const CrashReportModal: React.FC<CrashReportModalProps> = ({
  isOpen,
  onClose,
  report,
  allReports = [],
  onRecover,
  isAutomaticCrash = false,
}) => {
  const { t } = useLanguage();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(true);
  const [activeReportIndex, setActiveReportIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayReports = allReports.length > 0 ? allReports : (report ? [report] : []);
  const activeReport = displayReports[activeReportIndex] || report;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (format: 'txt' | 'json' = 'txt') => {
    if (activeReport) {
      downloadCrashReportFile(activeReport, format);
      showToast(t('CRASH_COPIED') || 'Report downloaded');
    }
  };

  const handleShare = async () => {
    if (activeReport) {
      const result = await shareCrashReportData(activeReport);
      if (result.shared) {
        showToast(t('CRASH_SHARE_SUCCESS') || 'Shared successfully');
      } else if (result.copied) {
        showToast(t('CRASH_COPIED') || 'Report copied to clipboard!');
      } else {
        showToast('Sharing not supported on this browser.');
      }
    }
  };

  const handleRecover = () => {
    if (onRecover) {
      onRecover();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 relative my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b shrink-0 flex items-start justify-between gap-3 ${
          isAutomaticCrash ? 'bg-red-950/40 border-red-800/40' : 'bg-slate-800/60 border-slate-700/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isAutomaticCrash
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {t('CRASH_TITLE')}
                {isAutomaticCrash && (
                  <span className="text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t('CRASH_AUTO_DETECTED')}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {isAutomaticCrash ? t('CRASH_RECOVERY_MSG') : t('CRASH_SUBTITLE')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="bg-emerald-600/90 text-white text-xs px-4 py-2 text-center font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-150 shrink-0">
            <Check className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-3.5 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Multiple reports selector if > 1 report */}
          {displayReports.length > 1 && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Recorded Incidents: ({activeReportIndex + 1} / {displayReports.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={activeReportIndex === 0}
                  onClick={() => setActiveReportIndex((prev) => Math.max(0, prev - 1))}
                  className="px-2 py-1 bg-slate-800 rounded disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer text-slate-200"
                >
                  Prev
                </button>
                <button
                  disabled={activeReportIndex === displayReports.length - 1}
                  onClick={() => setActiveReportIndex((prev) => Math.min(displayReports.length - 1, prev + 1))}
                  className="px-2 py-1 bg-slate-800 rounded disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {!activeReport ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-slate-200">{t('CRASH_NO_ERRORS')}</p>
              <p className="text-xs text-slate-500">{t('CRASH_MANUAL_DESC')}</p>
            </div>
          ) : (
            <>
              {/* Essential Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    {t('CRASH_ERR_TYPE')}
                  </span>
                  <span className="font-semibold text-red-400 text-sm block truncate">
                    {activeReport.errorType}
                  </span>
                  {activeReport.occurrenceCount > 1 && (
                    <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full mt-1">
                      {t('CRASH_OCCURRENCES')}: {activeReport.occurrenceCount}x
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    {t('CRASH_AFFECTED_SYS')}
                  </span>
                  <span className="font-semibold text-sky-400 text-sm block truncate">
                    {activeReport.affectedSystem}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    {t('CRASH_SCREEN')} & {t('CRASH_GAME_MODE')}
                  </span>
                  <span className="font-medium text-slate-200 block truncate">
                    {activeReport.currentScreen} ({activeReport.gameMode})
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    {t('CRASH_LAST_ACTION')}
                  </span>
                  <span className="font-medium text-slate-300 block truncate">
                    {activeReport.lastAction}
                  </span>
                </div>
              </div>

              {/* Error Message Box */}
              <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-red-300 uppercase tracking-wider font-semibold block">
                  {t('CRASH_ERR_MSG')}
                </span>
                <p className="text-xs font-mono text-red-200 break-words leading-relaxed">
                  {activeReport.errorMessage}
                </p>
              </div>

              {/* Career & Season State if available */}
              {activeReport.careerState && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] text-amber-400 uppercase tracking-wider font-bold block">
                    ⚽ {t('CRASH_CAREER_STATE')}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Player</span>
                      <span className="font-semibold text-white">{activeReport.careerState.playerName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Club</span>
                      <span className="font-semibold text-white">{activeReport.careerState.club || 'Free Agent'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Pos / OVR</span>
                      <span className="font-semibold text-emerald-400">
                        {activeReport.careerState.position || 'ST'} ({activeReport.careerState.ovr ?? 70})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Age / Season</span>
                      <span className="font-semibold text-amber-300">
                        {activeReport.careerState.age ?? 17}y (Yr {(activeReport.careerState.seasonIndex ?? 0) + 1})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible Technical Details (Stack Trace & Timestamp) */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-3 text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    {t('CRASH_DETAILS_TOGGLE')} & Stack Trace
                  </span>
                  {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTechnicalDetails && (
                  <div className="p-3 border-t border-slate-800 space-y-3 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans uppercase">Timestamp</span>
                      <span className="text-slate-300">{new Date(activeReport.timestamp).toLocaleString()}</span>
                    </div>
                    {activeReport.stackTrace ? (
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans uppercase mb-1">Stack Trace</span>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[10px] overflow-x-auto max-h-40 leading-relaxed whitespace-pre-wrap">
                          {activeReport.stackTrace}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[10px] italic font-sans">No stack trace logged for this event.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {allReports.length > 0 && (
              <button
                onClick={() => {
                  clearCrashReports();
                  showToast('Crash log history cleared');
                }}
                className="p-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear Logs</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {activeReport && (
              <>
                <button
                  onClick={() => handleDownload('txt')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 border border-slate-700/60"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  {t('CRASH_DOWNLOAD_BTN')}
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 border border-slate-700/60"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t('CRASH_SHARE_BTN')}
                </button>
              </>
            )}

            <button
              onClick={handleRecover}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('CRASH_RECOVER_BTN')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
