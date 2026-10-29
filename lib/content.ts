import { unstable_cache, revalidateTag } from "next/cache";
import { getRedis, requireRedis, KEYS } from "./redis";
import { DEFAULT_TEAM } from "./default-team";
import {
  DEFAULT_RECRUITMENT,
  DEFAULT_SETTINGS,
  defaultEventMeta,
  type Announcement,
  type EventMeta,
  type RecruitmentConfig,
  type Series,
  type SiteSettings,
  type TeamMember,
} from "./content-types";

// Admin-editable content lives in Redis. Public pages read it through the Next cache,
// and every admin save clears the "site-content" tag so changes show straight away.
export const CONTENT_TAG = "site-content";
const CONTENT_REVALIDATE_SECONDS = 300;

async function readKey<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return (await redis.get<T>(key)) ?? null;
  } catch (error) {
    console.error(`Redis read failed for ${key}:`, error);
    return null;
  }
}

export function mergeSettings(stored: Partial<SiteSettings> | null): SiteSettings {
  if (!stored) return DEFAULT_SETTINGS;
  const storedSections = Array.isArray(stored.sections) ? stored.sections : [];
  const sections = [
    ...storedSections.filter((s) => DEFAULT_SETTINGS.sections.some((d) => d.id === s.id)),
    ...DEFAULT_SETTINGS.sections.filter((d) => !storedSections.some((s) => s.id === d.id)),
  ];
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    popup: { ...DEFAULT_SETTINGS.popup, ...(stored.popup || {}) },
    primaryCta: { ...DEFAULT_SETTINGS.primaryCta, ...(stored.primaryCta || {}) },
    sections,
    nav: Array.isArray(stored.nav) && stored.nav.length > 0 ? stored.nav : DEFAULT_SETTINGS.nav,
  };
}

export function mergeEventMeta(eventId: string, stored: Partial<EventMeta> | null | undefined): EventMeta {
  const base = defaultEventMeta(eventId);
  if (!stored) return base;
  return { ...base, ...stored, eventId, team: { ...base.team, ...(stored.team || {}) } };
}

export function mergeRecruitment(stored: Partial<RecruitmentConfig> | null): RecruitmentConfig {
  return { ...DEFAULT_RECRUITMENT, ...(stored || {}), casePools: { ...(stored?.casePools || {}) } };
}

// Uncached reads, for admin screens and API routes that must see the latest value
export const readSettings = async () => mergeSettings(await readKey<Partial<SiteSettings>>(KEYS.settings));
export const readAnnouncements = async () => (await readKey<Announcement[]>(KEYS.announcements)) || [];
export const readTeam = async () => {
  const team = await readKey<TeamMember[]>(KEYS.team);
  return team && team.length > 0 ? team : DEFAULT_TEAM;
};
export const readSeries = async () => (await readKey<Series[]>(KEYS.series)) || [];
export const readRecruitmentConfig = async () => mergeRecruitment(await readKey<Partial<RecruitmentConfig>>(KEYS.recruitment));

export async function readAllEventMeta(): Promise<Record<string, EventMeta>> {
  const redis = getRedis();
  if (!redis) return {};
  try {
    const raw = (await redis.hgetall<Record<string, Partial<EventMeta>>>(KEYS.eventMeta)) || {};
    return Object.fromEntries(Object.entries(raw).map(([id, meta]) => [id, mergeEventMeta(id, meta)]));
  } catch (error) {
    console.error("Redis read failed for event meta:", error);
    return {};
  }
}

export async function readEventMeta(eventId: string): Promise<EventMeta> {
  const redis = getRedis();
  if (!redis) return defaultEventMeta(eventId);
  try {
    return mergeEventMeta(eventId, await redis.hget<Partial<EventMeta>>(KEYS.eventMeta, eventId));
  } catch {
    return defaultEventMeta(eventId);
  }
}

// Cached reads for public pages
const cached = <T>(fn: () => Promise<T>, key: string) =>
  unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: CONTENT_REVALIDATE_SECONDS });

export const getSiteSettings = cached(readSettings, "settings");
export const getTeam = cached(readTeam, "team");
export const getSeries = cached(readSeries, "series");
export const getAllEventMeta = cached(readAllEventMeta, "event-meta");

// Writes (admin only; callers check the session)
export async function writeKey(key: string, value: unknown) {
  await requireRedis().set(key, value);
  revalidateTag(CONTENT_TAG, { expire: 0 });
}

export async function writeEventMeta(meta: EventMeta) {
  await requireRedis().hset(KEYS.eventMeta, { [meta.eventId]: meta });
  revalidateTag(CONTENT_TAG, { expire: 0 });
}
