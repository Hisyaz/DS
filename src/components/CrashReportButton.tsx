import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  subscribeCrashReports,
  getCrashReports,
  CrashReport,
  captureCrashReport
} from '../utils/crashReportSystem';
import { CrashReportModal } from './CrashReportModal';

export const CrashReportButton: React.FC = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<CrashReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeReportForModal, setActiveReportForModal] = useState<CrashReport | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCrashReports((updatedReports) => {
      setReports(updatedReports);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    // If no reports exist, generate a fresh manual diagnostic snapshot
    if (reports.length === 0) {
      const manualReport = captureCrashReport(
        'Manual User Bug & System Diagnostic Snapshot',
        'User Interface',
        false
      );
      setActiveReportForModal(manualReport);
    } else {
      setActiveReportForModal(reports[0]);
    }
    setIsModalOpen(true);
  };

  const hasErrors = reports.length > 0;

  return (
    <>
      {/* Subtle Persistent "Report Bug" Trigger */}
      <div className="fixed bottom-3 right-3 z-[9000] pointer-events-auto">
        <button
          onClick={handleOpenModal}
          className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer border ${
            hasErrors
              ? 'bg-red-950/80 border-red-500/50 text-red-300 hover:bg-red-900 hover:border-red-400 hover:scale-105'
              : 'bg-slate-900/80 border-amber-500/30 text-amber-300/90 hover:text-amber-200 hover:bg-slate-800 hover:border-amber-400/60 opacity-70 hover:opacity-100 hover:scale-105'
          }`}
          title={t('CRASH_TITLE')}
        >
          <div className="relative flex items-center justify-center">
            <Bug className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
            {hasErrors && (
              <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight">
            {t('BUG_REPORT_BTN')}
          </span>
          {hasErrors && (
            <span className="ml-0.5 bg-red-500/30 text-red-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-red-500/40">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {/* Modal View */}
      <CrashReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={activeReportForModal}
        allReports={reports}
        isAutomaticCrash={false}
      />
    </>
  );
};
