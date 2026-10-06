import React, { useState } from 'react';
import { CareerCollectedCard, CollectedCardCategory } from '../types';
import { CardVisualRenderer, UniversalCardCategory } from './CardVisualRenderer';
import {
  getFameMilestone,
  getInfamyTierInfo,
  getBadFameDrawChancePercent,
} from '../utils/cardsCollectionSystem';
import {
  FolderHeart,
  Users,
  Flame,
  Trophy,
  Award,
  Lock,
  Eye,
  Star,
  FileText,
  TrendingDown,
} from 'lucide-react';

interface CardsCollectionPanelProps {
  collectedCards?: CareerCollectedCard[];
  fame?: number;
  badReputation?: number;
  equippedParentCard?: any;
}

export const CardsCollectionPanel: React.FC<CardsCollectionPanelProps> = ({
  collectedCards = [],
  fame = 150,
  badReputation = 25,
  equippedParentCard,
}) => {
  const [activeTab, setActiveTab] = useState<CollectedCardCategory | 'all'>('all');

  const cardsList = collectedCards || [];

  const parentCards = cardsList.filter((c) => c.category === 'parent');
  const youthLeagueCards = cardsList.filter((c) => c.category === 'youth_league');
  const streetCards = cardsList.filter((c) => c.category === 'street');
  const badFameCards = cardsList.filter((c) => c.category === 'bad_fame');
  const otherCareerCards = cardsList.filter((c) => c.category === 'other_career');

  const fameMilestone = getFameMilestone(fame);
  const infamyInfo = getInfamyTierInfo(badReputation);
  const drawChance = getBadFameDrawChancePercent(badReputation);

  const getFilteredCards = () => {
    if (activeTab === 'parent') return parentCards;
    if (activeTab === 'youth_league') return youthLeagueCards;
    if (activeTab === 'street') return streetCards;
    if (activeTab === 'bad_fame') return badFameCards;
    if (activeTab === 'other_career') return otherCareerCards;
    return cardsList;
  };

  const currentCards = getFilteredCards();

  const getUniversalCategory = (card: CareerCollectedCard): UniversalCardCategory => {
    if (card.category === 'bad_fame') return 'negative';
    if (card.rarity === 'Iconic' || card.rarity === 'GOAT') return 'iconic';
    return 'positive';
  };

  return (
    <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              Career Mode Cards Collection
            </h2>
            <p className="text-[10px] text-gray-400">
              Read-Only History & Milestones • {cardsList.length} Collected Cards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-[#12131c] px-3 py-1.5 rounded-lg border border-gray-800">
          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Viewing Mode Only (No edits/imports/exports)</span>
        </div>
      </div>

      {/* QUICK STATUS SUMMARY & INFAMY BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="bg-[#12131c] border border-gray-800 p-3 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Parent Card Status
            </span>
            <span className="text-amber-400 font-extrabold uppercase text-[9px]">
              {equippedParentCard ? equippedParentCard.rarity : 'Bound 1/1'}
            </span>
          </div>
          <p className="text-xs font-black text-white truncate flex items-center gap-1">
            {equippedParentCard ? (
              <>
                <span>{equippedParentCard.name}</span>
                <span className="text-[10px] text-amber-300 font-mono">({equippedParentCard.rarity})</span>
              </>
            ) : (
              parentCards[0]?.name || 'Permanent Parent Card'
            )}
          </p>
          <p className="text-[10px] text-gray-400 line-clamp-1">
            {equippedParentCard
              ? `Perk: ${equippedParentCard.perkTitle}`
              : 'Locked at Origin Academy Selection'}
          </p>
        </div>

        <div className="bg-[#12131c] border border-rose-950/80 p-3 rounded-xl space-y-1 bg-gradient-to-br from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1 text-rose-400">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Bad Reputation & Infamy
            </span>
            <span className="bg-rose-950 text-rose-300 font-black px-1.5 py-0.5 rounded text-[9px] border border-rose-500/30">
              {infamyInfo.tierRoman} — {infamyInfo.name}
            </span>
          </div>
          <div className="text-xs font-black text-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>Score: {badReputation} / 100</span>
              {infamyInfo.tierNumber > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-3.5 px-1 text-[8px] font-pixel font-black bg-rose-950 text-rose-300 border border-rose-500 pixel-corners shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                  {infamyInfo.tierNumber === 1 ? 'I' : infamyInfo.tierNumber === 2 ? 'II' : 'III'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-rose-300 font-bold">Draw Chance: {drawChance}%</span>
          </div>
          <span className="text-[10px] font-retro text-rose-400 block pt-0.5 font-bold tracking-wide">
            {infamyInfo.tierNumber === 0
              ? 'Clean Record'
              : infamyInfo.tierNumber === 1
              ? 'I "Bad Boy"'
              : infamyInfo.tierNumber === 2
              ? 'II "Menace"'
              : 'III "Psycho"'}
          </span>
          <div className="text-[10px] text-rose-300/80 flex items-center gap-2 pt-0.5">
            <span className="flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3 text-rose-400" />
              Valuation: -{infamyInfo.ovrValuationPenalty} OVR
            </span>
            <span className="flex items-center gap-0.5">
              <FileText className="w-3 h-3 text-amber-400" />
              Max Contract: {infamyInfo.maxContractYears} Yr{infamyInfo.maxContractYears > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="bg-[#12131c] border border-amber-950/80 p-3 rounded-xl space-y-1 bg-gradient-to-br from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Fame Status
            </span>
            <span className="text-amber-400 font-extrabold">{fame} / 1000</span>
          </div>
          <p className="text-xs font-black text-amber-300 truncate">
            {fameMilestone.title}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            {fameMilestone.description}
          </p>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#12131c] border border-gray-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
            activeTab === 'all'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Cards ({cardsList.length})
        </button>

        <button
          onClick={() => setActiveTab('parent')}
          className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
            activeTab === 'parent'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          Parent Cards ({parentCards.length}/1)
        </button>

        <button
          onClick={() => setActiveTab('youth_league')}
          className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
            activeTab === 'youth_league'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-sky-500" />
          Youth League Cards ({youthLeagueCards.length})
        </button>

        <button
          onClick={() => setActiveTab('street')}
          className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
            activeTab === 'street'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          Street Cards ({streetCards.length})
        </button>

        <button
          onClick={() => setActiveTab('bad_fame')}
          className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
            activeTab === 'bad_fame'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          Bad Fame Cards ({badFameCards.length})
        </button>

        <button
          onClick={() => setActiveTab('other_career')}
          className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
            activeTab === 'other_career'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Other Career Cards ({otherCareerCards.length})
        </button>
      </div>

      {/* CARDS DISPLAY GRID */}
      {currentCards.length === 0 ? (
        <div className="bg-[#12131c] border border-gray-800 rounded-xl p-8 text-center space-y-2">
          <Eye className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-xs font-bold text-gray-400">No cards in this category yet.</p>
          <p className="text-[10px] text-gray-500">
            Earn career milestones or story choices to unlock permanent collection cards!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCards.map((card, idx) => {
            const categoryType = getUniversalCategory(card);
            const cardFamily =
              card.category === 'parent'
                ? 'parent'
                : card.category === 'street'
                ? 'street'
                : card.category === 'youth_league'
                ? 'youth'
                : 'career';

            return (
              <CardVisualRenderer
                key={card.id || idx}
                card={card}
                cardId={card.id}
                cardFamily={cardFamily}
                name={card.name}
                description={card.description}
                categoryType={categoryType}
                categoryLabel={card.category.toUpperCase().replace('_', ' ')}
                rarity={card.rarity}
                effectDescriptions={card.effects}
                subTitle={`Obtained: ${card.obtainedAt}`}
                index={idx}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

