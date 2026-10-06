import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Award,
  TrendingUp,
  Activity,
  GraduationCap,
  FileText,
  Globe,
  DollarSign,
  Heart,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  WIKI_TOPICS,
  WikiTopic,
  isTutorialEnabled,
  setTutorialEnabled,
  resetSeenTutorials,
} from '../utils/tutorialSystem';

interface CareerTutorialWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Award,
  TrendingUp,
  Activity,
  GraduationCap,
  FileText,
  Globe,
  DollarSign,
  Sparkles,
  Heart,
  Flame,
  HelpCircle,
};

export const CareerTutorialWikiModal: React.FC<CareerTutorialWikiModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'core' | 'development' | 'matches' | 'career' | 'economy'
  >('all');
  const [activeTopicId, setActiveTopicId] = useState<string>(WIKI_TOPICS[0].id);
  const [tutorialActive, setTutorialActive] = useState<boolean>(() => isTutorialEnabled());

  const categories: {
    id: 'all' | 'core' | 'development' | 'matches' | 'career' | 'economy';
    labelKey: string;
    defaultLabel: string;
  }[] = [
    { id: 'all', labelKey: 'WIKI_CAT_ALL', defaultLabel: 'All Topics' },
    { id: 'core', labelKey: 'WIKI_CAT_CORE', defaultLabel: 'Cards & Store' },
    { id: 'development', labelKey: 'WIKI_CAT_DEV', defaultLabel: 'Development' },
    { id: 'matches', labelKey: 'WIKI_CAT_MATCHES', defaultLabel: 'Matchdays' },
    { id: 'career', labelKey: 'WIKI_CAT_CAREER', defaultLabel: 'Career & Club' },
    { id: 'economy', labelKey: 'WIKI_CAT_ECONOMY', defaultLabel: 'Economy' },
  ];

  const filteredTopics = useMemo(() => {
    return WIKI_TOPICS.filter((topic) => {
      if (selectedCategory !== 'all' && topic.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (t(topic.titleKey) || '').toLowerCase();
        const desc = (t(topic.descriptionKey) || '').toLowerCase();
        const tag = (t(topic.tagKey) || '').toLowerCase();
        return title.includes(query) || desc.includes(query) || tag.includes(query);
      }
      return true;
    });
  }, [selectedCategory, searchQuery, t]);

  const activeTopic = useMemo(() => {
    return WIKI_TOPICS.find((top) => top.id === activeTopicId) || filteredTopics[0] || WIKI_TOPICS[0];
  }, [activeTopicId, filteredTopics]);

  if (!isOpen) return null;

  const handleToggleTutorial = () => {
    const next = !tutorialActive;
    setTutorialActive(next);
    setTutorialEnabled(next);
    showToast?.(
      next
        ? t('TUTORIAL_TOAST_ENABLED') || '✅ In-game tutorial explanations ENABLED.'
        : t('TUTORIAL_TOAST_DISABLED') || 'ℹ️ In-game tutorial explanations DISABLED.'
    );
  };

  const handleResetPrompts = () => {
    resetSeenTutorials();
    showToast?.(
      t('TUTORIAL_TOAST_RESET') ||
        '🔄 All introductory explanation prompts reset! They will appear on your next visits.'
    );
  };

  const TopicIcon = activeTopic ? (ICON_MAP[activeTopic.iconName] || BookOpen) : BookOpen;

  return (
    <div
      id="career-tutorial-wiki-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="career-tutorial-wiki-modal"
        className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-slate-900 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white font-pixel"
      >
        {/* Retro Scanlines */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        {/* HEADER */}
        <header className="p-3 sm:p-4 border-b-2 border-amber-500/60 bg-slate-950 shrink-0 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950 border border-amber-400 pixel-bevel-gold text-amber-300 flex items-center justify-center shadow-md font-black shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-arcade tracking-wide text-white uppercase">
                  {t('WIKI_HEADER_TITLE') || 'CAREER ENCYCLOPEDIA & WIKI'}
                </h2>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase bg-amber-950 text-amber-300 border border-amber-400 pixel-bevel-gold">
                  {t('WIKI_BADGE_GUIDE') || 'GAME MANUAL'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-retro">
                {t('WIKI_HEADER_SUBTITLE') ||
                  'Complete guide and mechanics encyclopedia for DrawStar Football Career.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {/* IN-GAME TUTORIAL ON/OFF TOGGLE */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 border border-slate-700 pixel-bevel-raised">
              <span className="text-[9px] font-arcade uppercase text-slate-300">
                {t('TUTORIAL_HINTS_LABEL') || 'Tutorial Hints'}:
              </span>
              <button
                type="button"
                onClick={handleToggleTutorial}
                className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded transition-all cursor-pointer border ${
                  tutorialActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {tutorialActive
                  ? t('TUTORIAL_STATE_ON') || 'ON'
                  : t('TUTORIAL_STATE_OFF') || 'OFF'}
              </button>
            </div>

            {/* RESET PROMPTS BUTTON */}
            <button
              type="button"
              onClick={handleResetPrompts}
              className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-400 text-indigo-300 text-[9px] font-arcade uppercase font-black transition-colors cursor-pointer flex items-center gap-1.5 pixel-bevel-raised"
              title="Reset seen explanations"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">
                {t('TUTORIAL_RESET_BTN') || 'Reset Prompts'}
              </span>
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-600 pixel-bevel-raised"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SEARCH BAR & CATEGORY TABS */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 shrink-0 relative z-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-[9.5px] font-arcade uppercase cursor-pointer border transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black pixel-bevel-gold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t(cat.labelKey) || cat.defaultLabel}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('WIKI_SEARCH_PLACEHOLDER') || 'Search topics...'}
              className="w-full pl-8 pr-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* BODY: 2-COLUMN VIEW (TOPICS LIST ON LEFT, DETAIL ARTICLE ON RIGHT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
          {/* LEFT SIDEBAR: TOPIC LIST */}
          <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 overflow-y-auto custom-scrollbar shrink-0 p-2 space-y-1.5 max-h-[35vh] md:max-h-full">
            {filteredTopics.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-[11px] font-mono">
                {t('WIKI_NO_TOPICS_FOUND') || 'No topics matched your search.'}
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const Icon = ICON_MAP[topic.iconName] || BookOpen;
                const isSelected = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`w-full p-2.5 text-left border pixel-corners flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md pixel-bevel-gold'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`w-7 h-7 flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10.5px] font-arcade font-black uppercase truncate">
                          {t(topic.titleKey) || topic.titleKey}
                        </div>
                        <div className="text-[8.5px] font-mono text-slate-400 uppercase truncate">
                          {t(topic.tagKey) || topic.tagKey}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT PANEL: FULL ARTICLE CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-900/40">
            {activeTopic ? (
              <div className="space-y-5 max-w-3xl">
                {/* ARTICLE HEADER */}
                <div className="border-b border-amber-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-950 border-2 border-amber-400 pixel-bevel-gold text-amber-300 flex items-center justify-center shadow-lg shrink-0">
                      <TopicIcon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                        {t(activeTopic.tagKey) || activeTopic.tagKey}
                      </span>
                      <h3 className="text-lg sm:text-xl font-arcade font-black uppercase text-white tracking-wide mt-1">
                        {t(activeTopic.titleKey) || activeTopic.titleKey}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-retro leading-relaxed mt-3 bg-slate-950/80 p-3 border border-slate-800 rounded-lg">
                    {t(activeTopic.descriptionKey) || activeTopic.descriptionKey}
                  </p>
                </div>

                {/* KEY BULLET POINTS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-arcade font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t('WIKI_KEY_MECHANICS') || 'Core Rules & Key Mechanics'}
                  </h4>

                  <div className="space-y-2.5">
                    {activeTopic.bulletPointsKeys.map((ptKey, idx) => (
                      <div
                        key={ptKey}
                        className="p-3 bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 pixel-corners flex items-start gap-3 transition-colors"
                      >
                        <div className="w-5 h-5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded flex items-center justify-center text-[10px] font-mono font-black shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-300 font-retro leading-relaxed">
                          {t(ptKey) || ptKey}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTTOM HINT */}
                <div className="p-3 bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-500/30 flex items-center gap-3">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-200 font-mono">
                    {t('WIKI_BOTTOM_TIP') ||
                      'All career features are saved automatically. You can review this encyclopedia anytime from the Career Menu.'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
