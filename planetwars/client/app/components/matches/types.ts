import { MatchStats, MatchStatus, MatchType } from '../../utils/database/models';

export interface Player {
  name: string;
}

export interface Map {
  uuid: string;
  name: string;
}

export type Match = HostedMatch | JoinedMatch;
export type HostedMatch = PlayingHostedMatch | FinishedHostedMatch | ErroredHostedMatch;
export type JoinedMatch = PlayingJoinedMatch | FinishedJoinedMatch | ErroredJoinedMatch;

export interface MatchProps {
  uuid: string;
  timestamp: Date;
}

export type HostedMatchProps = MatchProps & {
  type: MatchType.hosted;
  map: Map;
  logPath: string;
  players: Player[];
};

export type PlayingHostedMatch = HostedMatchProps & {
  status: MatchStatus.playing,
};

export type FinishedHostedMatch = HostedMatchProps & {
  status: MatchStatus.finished,
  stats: MatchStats,
};

export type ErroredHostedMatch = HostedMatchProps & {
  status: MatchStatus.error,
  error: string,
};

export type JoinedMatchProps = MatchProps & {
  type: MatchType;
  localPlayers: Player[];
};

export type PlayingJoinedMatch = JoinedMatchProps & {
  status: MatchStatus.playing;
};

export type FinishedJoinedMatch = JoinedMatchProps & {
  status: MatchStatus.finished;
  importedLog?: { logPath: string; stats: MatchStats; playerNames: string[] };
};
export type ErroredJoinedMatch = JoinedMatchProps & {
  status: MatchStatus.error,
  importedLog?: { logPath: string; },
};
