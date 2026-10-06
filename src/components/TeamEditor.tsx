import React from 'react';
import { LeagueDatabase } from '../types/leagueEditor';
import { TeamEditorContainer } from './editor/TeamEditorContainer';

interface TeamEditorProps {
  leagueDb: LeagueDatabase;
  onUpdateDb: (updated: LeagueDatabase) => void;
  showToast: (msg: string) => void;
}

export const TeamEditor: React.FC<TeamEditorProps> = ({
  leagueDb,
  onUpdateDb,
  showToast,
}) => {
  return (
    <TeamEditorContainer
      leagueDb={leagueDb}
      onUpdateDb={onUpdateDb}
      showToast={showToast}
    />
  );
};
