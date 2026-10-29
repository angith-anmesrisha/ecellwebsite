// Shapes of the admin-editable content kept in Redis, plus the defaults the site falls back to
// when nothing has been saved yet. Safe to import from client components.

export interface FeaturedPopup {
  enabled: boolean;
  eyebrow: string;
  // A line break in the title splits it over two lines
  title: string;
  dateLabel: string;
  // ISO timestamps; the countdown runs to start and shows "happening now" until end
  startsAt: string;
  endsAt: string;
  location: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  hideAfterEnd: boolean;
}

export type HomeSectionId = "trends" | "ecosystem" | "board" | "sandbox" | "resources" | "recruitment" | "connect";

export interface HomeSection {
  id: HomeSectionId;
  visible: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  tagline: string;
  href: string;
  visible: boolean;
}

export interface PrimaryCta {
  label: string;
  subLabel: string;
  href: string;
}

export interface SiteSettings {
  popup: FeaturedPopup;
  heroTagline: string;
  heroSubtitle: string;
  sections: HomeSection[];
  nav: NavItem[];
  primaryCta: PrimaryCta;
  currentTenure: string;
}

export interface Announcement {
  id: string;
  text: string;
  link?: string;
  linkLabel?: string;
  // Optional window; empty means "from now" / "until removed"
  startsAt?: string;
  endsAt?: string;
  // Shown as the site-wide notice bar (only the newest pinned one shows)
  pinned: boolean;
  // Ties the notice to one event's live page
  eventId?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
  linkedin: string;
  tenure: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  eventIds: string[];
  // Sessions someone has to attend to count as completing the series
  requiredCount: number;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface CasePool {
  triggers: string[];
  escalations: string[];
  constraints: string[];
}

export interface RecruitmentConfig {
  // Countdown target on the locked portal
  launchAt?: string;
  // Automatic phase switches; each applies once its time passes, unless an admin changes the phase later
  openAt?: string;
  standbyAt?: string;
  completedAt?: string;
  // Custom quiz; empty means the built-in 30 questions
  questions: QuizQuestion[];
  marksCorrect: number;
  marksWrong: number;
  caseMinWords: number;
  // Custom case scenarios per department; missing departments use the built-in ones
  casePools: Partial<Record<"ops" | "media" | "spons", CasePool>>;
  updatedAt?: string;
}

export interface ScheduleItem {
  id: string;
  startsAt: string;
  endsAt?: string;
  title: string;
  location?: string;
  speaker?: string;
}

export interface Speaker {
  name: string;
  role: string;
  photo?: string;
  link?: string;
}

export interface Sponsor {
  name: string;
  tier: string;
  logo?: string;
  url?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface RubricItem {
  id: string;
  label: string;
  max: number;
}

export interface CompetitionRound {
  id: string;
  name: string;
  // What entrants submit, e.g. "Pitch deck link"
  submissionLabel: string;
  submissionsOpenAt?: string;
  submissionsCloseAt?: string;
  rubric: RubricItem[];
  // Leaderboard shown on the event page
  published: boolean;
  // How many names the public leaderboard shows
  publishTop: number;
}

export interface Recap {
  summary: string;
  photos: string[];
  winners: { place: string; name: string }[];
  stats: { label: string; value: string }[];
  quote?: string;
}

export interface EventMeta {
  eventId: string;
  slug?: string;
  tagline?: string;
  venue?: string;
  startsAt?: string;
  endsAt?: string;
  rules?: string;
  // Registration limits
  capacity?: number;
  waitlist: boolean;
  opensAt?: string;
  closesAt?: string;
  // Ask outside participants where they're from
  collectCollege: boolean;
  schedule: ScheduleItem[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  faq: FaqItem[];
  team: { enabled: boolean; minSize: number; maxSize: number };
  rounds: CompetitionRound[];
  recap?: Recap;
}

// Public event record as the Google Sheet returns it
export interface SheetEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  status: string;
  customFields: string[];
  bannerUrl?: string;
}

export const DEFAULT_POPUP: FeaturedPopup = {
  enabled: true,
  eyebrow: "Live Event Protocol Active",
  title: "Startup\nHeist",
  dateLabel: "Nov 2 & 3",
  startsAt: "2026-11-02T00:00:00+05:30",
  endsAt: "2026-11-04T00:00:00+05:30",
  location: "BIMTECH, Greater Noida",
  body: "The secure gateway for the Startup Heist event is currently active. Authorized participants can proceed to the assessment portal to begin.",
  ctaLabel: "Take Me There",
  ctaHref: "/quiz-entry",
  hideAfterEnd: false,
};

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  trends: "Trending in tech",
  ecosystem: "Explore our ecosystem",
  board: "The Board (team)",
  sandbox: "Startup idea sandbox",
  resources: "Student resources links",
  recruitment: "Join the committee banner",
  connect: "Contact section",
};

export const DEFAULT_SETTINGS: SiteSettings = {
  popup: DEFAULT_POPUP,
  heroTagline: "Where Aspiration Meets Opportunity",
  heroSubtitle: "Empowering the next generation of founders at BIMTECH. We help turn your ideas into impactful ventures.",
  sections: (Object.keys(HOME_SECTION_LABELS) as HomeSectionId[]).map((id) => ({ id, visible: true })),
  nav: [
    { id: "trends", label: "Trends", tagline: "what's new", href: "#ai-feed", visible: true },
    { id: "ecosystem", label: "Ecosystem", tagline: "explore", href: "#ecosystem", visible: true },
    { id: "results", label: "Results", tagline: "check status", href: "/results", visible: true },
    { id: "board", label: "The Board", tagline: "our team", href: "#team", visible: true },
    { id: "sandbox", label: "Sandbox", tagline: "test an idea", href: "#simulator", visible: true },
  ],
  primaryCta: { label: "Apply Portal", subLabel: "join us", href: "/recruitment" },
  currentTenure: "2026-27",
};

export const DEFAULT_RECRUITMENT: RecruitmentConfig = {
  questions: [],
  marksCorrect: 3,
  marksWrong: -1,
  caseMinWords: 50,
  casePools: {},
};

export function defaultEventMeta(eventId: string): EventMeta {
  return {
    eventId,
    waitlist: false,
    collectCollege: false,
    schedule: [],
    speakers: [],
    sponsors: [],
    faq: [],
    team: { enabled: false, minSize: 2, maxSize: 4 },
    rounds: [],
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 60);
}

export function eventSlug(event: Pick<SheetEvent, "id" | "title">, meta?: Pick<EventMeta, "slug">) {
  return meta?.slug || slugify(event.title) || event.id;
}

// Announcements that should show right now
export function isAnnouncementLive(a: Announcement, now = Date.now()) {
  if (a.startsAt && new Date(a.startsAt).getTime() > now) return false;
  if (a.endsAt && new Date(a.endsAt).getTime() <= now) return false;
  return true;
}

export function registrationWindow(meta: EventMeta | undefined, now = Date.now()): "open" | "not-yet" | "closed" {
  if (meta?.opensAt && new Date(meta.opensAt).getTime() > now) return "not-yet";
  if (meta?.closesAt && new Date(meta.closesAt).getTime() <= now) return "closed";
  return "open";
}
