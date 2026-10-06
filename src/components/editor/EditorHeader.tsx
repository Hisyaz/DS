import React, { useState } from 'react';
import { ArrowLeft, Save, Check, LayoutGrid, ChevronDown } from 'lucide-react';
import { CustomEmblem } from '../CustomEmblem';
import { EmblemConfig } from '../../types';

interface EditorSectionInfo {
  id: string;
  name: string;
  shortLabel?: string;
}

interface EditorHeaderProps {
  title: string;
  subtitle?: string;
  emblem?: EmblemConfig;
  currentSectionIndex?: number;
  totalSections?: number;
  sections?: EditorSectionInfo[];
  onSelectSection?: (index: number) => void;
  onBack?: () => void;
  backLabel?: string;
  onSave?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  subtitle,
  emblem,
  currentSectionIndex = 0,
  totalSections,
  sections,
  onSelectSection,
  onBack,
  backLabel = 'Back',
  onSave,
  isSaving = false,
  lastSavedAt,
}) => {
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState(false);

  return (
    <header className="w-full bg-slate-950/95 border-b border-slate-800/90 backdrop-blur-md px-4 py-3 shrink-0 select-none z-20">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Back button and Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-black flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 shadow-sm"
              title={backLabel}
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline font-mono">{backLabel}</span>
              <span className="sm:hidden font-mono">BACK</span>
            </button>
          )}

          {/* Team / Category info showcase */}
          <div className="flex items-center gap-2.5 min-w-0">
            {emblem ? (
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-1 shrink-0 shadow-inner">
                <CustomEmblem emblem={emblem} size="sm" />
              </div>
            ) : null}

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate flex items-center gap-2">
                <span>{title}</span>
                {totalSections && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold shrink-0">
                    {currentSectionIndex + 1} / {totalSections}
                  </span>
                )}
              </h1>
              {subtitle && (
                <p className="text-[11px] sm:text-xs font-bold text-cyan-400 truncate tracking-wide uppercase">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Section Jump Drawer & Persistent Save Button */}
        <div className="flex items-center gap-2 shrink-0">
          {sections && sections.length > 0 && onSelectSection && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsJumpMenuOpen((prev) => !prev)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                title="Jump to Section"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Sections</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isJumpMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsJumpMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-40 max-h-96 overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                      Jump to Section
                    </div>
                    {sections.map((sec, idx) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          onSelectSection(idx);
                          setIsJumpMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          idx === currentSectionIndex
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="truncate">
                          {idx + 1}. {sec.name}
                        </span>
                        {idx === currentSectionIndex && (
                          <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg ${
                isSaving
                  ? 'bg-emerald-700 text-emerald-200 border border-emerald-500/50'
                  : lastSavedAt
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 shadow-emerald-600/30'
              }`}
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{isSaving ? 'SAVING...' : 'SAVE TEAM'}</span>
              <span className="sm:hidden">{isSaving ? 'SAVING' : 'SAVE'}</span>
              {lastSavedAt && !isSaving && (
                <Check className="w-3.5 h-3.5 text-emerald-200 ml-0.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
