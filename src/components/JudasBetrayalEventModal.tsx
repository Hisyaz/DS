import React from 'react';
import { PlayerCardData } from '../types';
import { ShieldAlert, Flame, DollarSign, Trophy, ArrowRight, X, Skull, Award } from 'lucide-react';
import { RivalBetrayalCheckResult } from '../utils/perksSystem';
import { useLanguage } from '../context/LanguageContext';

interface JudasBetrayalEventModalProps {
  player: PlayerCardData;
  betrayalData: RivalBetrayalCheckResult;
  transferFeeFormatted?: string;
  weeklyWageFormatted?: string;
  onAcceptTransfer: () => void;
  onRejectTransfer: () => void;
}

export const JudasBetrayalEventModal: React.FC<JudasBetrayalEventModalProps> = ({
  player,
  betrayalData,
  transferFeeFormatted = '€90.0M',
  weeklyWageFormatted = '€350,000 / week',
  onAcceptTransfer,
  onRejectTransfer,
}) => {
  const { t, currentLanguage } = useLanguage();
  const lang = currentLanguage || 'en-GB';

  const isSpanish = lang.startsWith('es');
  const isPortuguese = lang.startsWith('pt');
  const isFrench = lang.startsWith('fr');
  const isGerman = lang.startsWith('de');
  const isItalian = lang.startsWith('it');

  let title = t('THE FORBIDDEN CROSSING');
  let subtitle = t('DIRECT TRANSFER TO ARCH-RIVAL • THE JUDAS SUMMIT');
  let bannerText = betrayalData.rivalryName ? `${betrayalData.rivalryName.toUpperCase()} DIVIDE` : t('BITTER RIVALRY CROSSING');
  let acceptText = t('🔥 Cross the Divide (Embrace Judas Destiny)');
  let rejectText = t('🛡️ Reject the Treachery (Remain Loyal)');
  let warningText = t('ACCEPTING THIS MOVE FORCIBLY ASSIGNS THE JUDAS PERK & DOUBLES ALL FUTURE BAD REPUTATION (×2)');

  if (isSpanish) {
    title = 'EL CRUCE PROHIBIDO';
    subtitle = 'TRASPASO DIRECTO AL MÁXIMO RIVAL • LA CUMBRE DE JUDAS';
    acceptText = '🔥 Cruzar de Vereda (Aceptar el Destino de Judas)';
    rejectText = '🛡️ Rechazar la Traición (Permanecer Leal)';
    warningText = 'ACEPTAR ESTE TRASPASO ASIGNA OBLIGATORIAMENTE EL PERK JUDAS Y DUPLICA TODA REPUTACIÓN NEGATIVA (x2)';
  } else if (isPortuguese) {
    title = 'A TRAVESSIA PROIBIDA';
    subtitle = 'TRANSFERÊNCIA DIRETA PARA O ARQUIRRIVAL • O ENCONTRO DE JUDAS';
    acceptText = '🔥 Fazer a Travessia (Abraçar o Destino de Judas)';
    rejectText = '🛡️ Rejeitar a Traição (Manter Lealdade)';
    warningText = 'ACEITAR ESTA TRANSFERÊNCIA ATRIBUI OBRIGATORIAMENTE O PERK JUDAS E DOBRA A REPUTAÇÃO NEGATIVA (x2)';
  } else if (isFrench) {
    title = 'LE PASSAGE INTERDIT';
    subtitle = 'TRANSFERT DIRECT CHEZ LE RIVAL HISTORIQUE • LE SOMMET JUDAS';
    acceptText = '🔥 Franchir la Ligne (Embrasser le Destin de Judas)';
    rejectText = '🛡️ Rejeter la Trahison (Rester Fidèle)';
    warningText = 'ACCEPTER CE TRANSFERT ASSIGNE DE FORCE LE PERK JUDAS ET DOUBLE TOUTE MAUVAISE RÉPUTATION (x2)';
  } else if (isGerman) {
    title = 'DER VERBOTENE WECHSEL';
    subtitle = 'DIREKTTRANSFER ZUM ERZRIVALEN • DER JUDAS-GIPFEL';
    acceptText = '🔥 Die Grenze überschreiten (Judas-Schicksal annehmen)';
    rejectText = '🛡️ Den Verrat ablehnen (Loyal bleiben)';
    warningText = 'DIESER TRANSFER VERGIBT ZWINGEND DEN JUDAS-PERK UND VERDOPPELT NEGATIVE REPUTATION (x2)';
  } else if (isItalian) {
    title = 'IL PASSAGGIO PROIBITO';
    subtitle = 'TRASFERIMENTO DIRETTO AI RIVALI STORICI • IL VERTICE DI GIUDA';
    acceptText = '🔥 Attraversare il Divario (Accetta il Destino di Giuda)';
    rejectText = '🛡️ Rifiuta il Tradimento (Rimani Fedele)';
    warningText = 'ACCETTARE QUESTO TRASFERIMENTO ASSEGNA IL PERK GIUDA E RADDOPPIA TUTTA LA CATTIVA REPUTAZIONE (x2)';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-950 via-rose-950/40 to-slate-950 border-2 border-rose-600/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(225,29,72,0.4)] text-white max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-rose-500 to-transparent blur-sm" />

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-900/60 border border-rose-500/60 text-rose-300 text-xs font-black uppercase tracking-widest mb-2 shadow-lg animate-pulse">
            <Skull className="w-4 h-4 text-rose-400" />
            <span>{bannerText}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-200 to-rose-400">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/80 font-medium tracking-wide mt-1">
            {subtitle}
          </p>
        </div>

        {/* Club Confrontation Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-rose-950/50 to-slate-900/90 border border-rose-500/40 flex items-center justify-around gap-4 mb-4 shrink-0 shadow-inner">
          {/* Betrayed Club */}
          <div className="text-center flex-1">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Betrayed Club</div>
            <div className="text-base sm:text-xl font-black text-rose-300 truncate mt-0.5">
              {betrayalData.betrayedClub}
            </div>
            <div className="text-[11px] text-rose-400 font-bold mt-0.5 flex items-center justify-center gap-1">
              <span>💔 Former Home</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-2">
            <div className="w-10 h-10 rounded-full bg-rose-600/30 border border-rose-500/60 flex items-center justify-center text-rose-300 shadow-md">
              <ArrowRight className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1">CROSSING</span>
          </div>

          {/* Destination Club */}
          <div className="text-center flex-1">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Bitter Arch-Rival</div>
            <div className="text-base sm:text-xl font-black text-amber-300 truncate mt-0.5">
              {betrayalData.destinationClub}
            </div>
            <div className="text-[11px] text-amber-400 font-bold mt-0.5 flex items-center justify-center gap-1">
              <span>👑 New Empire</span>
            </div>
          </div>
        </div>

        {/* Scrollable Narrative & Stakes */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3.5 mb-4">
          {/* 4 Pillars of the Decision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* 1. Rivalry */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Rivalry & Betrayal</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Direct transfers between these two clubs are forbidden taboos. Fans will burn jerseys, orchestrate deafening whistles, and label you a mercenary traitor for eternity.
              </p>
            </div>

            {/* 2. Glory */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Trophies & Glory</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {betrayalData.destinationClub} offers an elite tactical setup and immediate championship contention to cement your legacy at the highest tier of world football.
              </p>
            </div>

            {/* 3. Financial Package */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Financial Windfall</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Package: <strong className="text-emerald-300">{weeklyWageFormatted}</strong> plus a massive signing bonus and world-record transfer visibility.
              </p>
            </div>

            {/* 4. Judas Consequences */}
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/50 space-y-1">
              <div className="flex items-center gap-2 text-rose-300 font-black text-xs uppercase">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Consequences: Judas Perk</span>
              </div>
              <p className="text-rose-200 text-[11px] leading-relaxed">
                Forcibly awards the <strong className="text-white font-bold">🐍 Judas Perk</strong>. All Bad Reputation gains from any source are permanently doubled (×2).
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-500/60 text-center">
            <div className="text-[11px] font-black text-rose-300 uppercase tracking-wide flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{warningText}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 pt-2 border-t border-slate-800">
          <button
            onClick={onRejectTransfer}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-400 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 text-center"
          >
            {rejectText}
          </button>

          <button
            onClick={onAcceptTransfer}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.5)] active:scale-95 flex items-center justify-center gap-2 text-center"
          >
            <span>{acceptText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
