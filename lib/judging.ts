import { getRedis, KEYS } from "./redis";
import { listEventRegistrations } from "./store";
import { getTeams } from "./registrations";
import type { CompetitionRound, EventMeta } from "./content-types";

// Competitions: entrants (teams, or individuals when the event has no teams) submit a link
// per round, judges score them against the round's rubric, and the admin shortlists who moves on.

export interface Judge {
  code: string;
  name: string;
  eventIds: string[];
  createdAt: string;
}

export interface Entrant {
  id: string;
  name: string;
  members: string[];
  emails: string[];
}

export interface Submission {
  link: string;
  note?: string;
  at: string;
  by: string;
}

export interface ScoreCard {
  scores: Record<string, number>;
  comment?: string;
  at: string;
}

export interface LeaderboardRow {
  entrant: Entrant;
  judgeCount: number;
  rawAverage: number;
  normalized: number | null;
  rank: number;
  advanced: boolean;
  submission: Submission | null;
}

export async function getJudges(): Promise<Judge[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, Judge>>(KEYS.judges)) || {};
  return Object.values(all).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getJudge(code: string) {
  const redis = getRedis();
  if (!redis) return null;
  return (await redis.hget<Judge>(KEYS.judges, code)) ?? null;
}

export async function getEntrants(eventId: string, meta: EventMeta): Promise<Entrant[]> {
  const redis = getRedis();
  const cancelled = redis ? new Set((await redis.smembers(KEYS.cancelled(eventId))) as string[]) : new Set<string>();
  if (meta.team.enabled) {
    return (await getTeams(eventId))
      .filter((t) => t.members.length > 0)
      .map((t) => ({ id: t.id, name: t.name, members: t.members.map((m) => m.name), emails: t.members.map((m) => m.email) }));
  }
  const rows = (await listEventRegistrations({ eventId })).filter((r) => !cancelled.has(r.regId));
  return rows.map((r) => ({ id: r.regId, name: r.name, members: [r.name], emails: [r.email] }));
}

// Who may take part in a round: everyone for the first, the shortlist of the previous one after that
export async function eligibleEntrants(eventId: string, meta: EventMeta, roundId: string) {
  const entrants = await getEntrants(eventId, meta);
  const idx = meta.rounds.findIndex((r) => r.id === roundId);
  if (idx <= 0) return entrants;
  const redis = getRedis();
  if (!redis) return entrants;
  const shortlisted = new Set((await redis.smembers(KEYS.advanced(eventId, meta.rounds[idx - 1].id))) as string[]);
  return entrants.filter((e) => shortlisted.has(e.id));
}

export async function getSubmissions(eventId: string, roundId: string) {
  const redis = getRedis();
  if (!redis) return {} as Record<string, Submission>;
  return ((await redis.hgetall<Record<string, Submission>>(KEYS.submissions(eventId, roundId))) || {}) as Record<string, Submission>;
}

export async function getScoreCards(eventId: string, roundId: string) {
  const redis = getRedis();
  if (!redis) return {} as Record<string, ScoreCard>;
  return ((await redis.hgetall<Record<string, ScoreCard>>(KEYS.scores(eventId, roundId))) || {}) as Record<string, ScoreCard>;
}

const total = (card: ScoreCard, round: CompetitionRound) =>
  round.rubric.reduce((sum, item) => sum + Math.min(item.max, Math.max(0, Number(card.scores[item.id]) || 0)), 0);

// Raw average of judges' totals, plus a normalised score that evens out strict and generous judges:
// each judge's totals become z-scores against their own mean, then those are averaged.
export async function buildLeaderboard(eventId: string, meta: EventMeta, round: CompetitionRound): Promise<LeaderboardRow[]> {
  const [entrants, submissions, cards] = await Promise.all([
    eligibleEntrants(eventId, meta, round.id),
    getSubmissions(eventId, round.id),
    getScoreCards(eventId, round.id),
  ]);
  const redis = getRedis();
  const advanced = redis ? new Set((await redis.smembers(KEYS.advanced(eventId, round.id))) as string[]) : new Set<string>();

  const byJudge = new Map<string, Map<string, number>>();
  for (const [field, card] of Object.entries(cards)) {
    const [judgeCode, entrantId] = field.split("|");
    if (!byJudge.has(judgeCode)) byJudge.set(judgeCode, new Map());
    byJudge.get(judgeCode)!.set(entrantId, total(card, round));
  }

  const zByEntrant = new Map<string, number[]>();
  const rawByEntrant = new Map<string, number[]>();
  for (const totals of byJudge.values()) {
    const values = [...totals.values()];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    for (const [entrantId, value] of totals) {
      if (!rawByEntrant.has(entrantId)) rawByEntrant.set(entrantId, []);
      if (!zByEntrant.has(entrantId)) zByEntrant.set(entrantId, []);
      rawByEntrant.get(entrantId)!.push(value);
      zByEntrant.get(entrantId)!.push(sd > 0 ? (value - mean) / sd : 0);
    }
  }

  const useNormalized = byJudge.size >= 2;
  const avg = (xs: number[] | undefined) => (xs && xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const rows = entrants.map((entrant) => ({
    entrant,
    judgeCount: rawByEntrant.get(entrant.id)?.length || 0,
    rawAverage: Math.round(avg(rawByEntrant.get(entrant.id)) * 10) / 10,
    normalized: useNormalized && zByEntrant.has(entrant.id) ? Math.round(avg(zByEntrant.get(entrant.id)) * 100) / 100 : null,
    rank: 0,
    advanced: advanced.has(entrant.id),
    submission: submissions[entrant.id] || null,
  }));

  rows.sort((a, b) => {
    if (a.judgeCount === 0 && b.judgeCount > 0) return 1;
    if (b.judgeCount === 0 && a.judgeCount > 0) return -1;
    if (useNormalized) return (b.normalized ?? -99) - (a.normalized ?? -99) || b.rawAverage - a.rawAverage;
    return b.rawAverage - a.rawAverage;
  });
  rows.forEach((row, i) => (row.rank = row.judgeCount > 0 ? i + 1 : 0));
  return rows;
}

export const maxScore = (round: CompetitionRound) => round.rubric.reduce((sum, r) => sum + r.max, 0);

export function roundOpenForSubmissions(round: CompetitionRound, now = Date.now()) {
  if (round.submissionsOpenAt && new Date(round.submissionsOpenAt).getTime() > now) return false;
  if (round.submissionsCloseAt && new Date(round.submissionsCloseAt).getTime() <= now) return false;
  return true;
}
