import { NextResponse, after } from "next/server";
import { randomInt } from "crypto";
import { getRedis, KEYS } from "@/lib/redis";
import { getEvents } from "@/lib/sheets";
import { sheetGet } from "@/lib/sheetClient";
import { readAllEventMeta, readSeries } from "@/lib/content";
import { eventSlug, type SheetEvent } from "@/lib/content-types";
import {
  cancelRegistration,
  getTeamForMember,
  promoteFromWaitlist,
  registrationsForEmail,
  sendPass,
  isCancelled,
} from "@/lib/registrations";
import { checkinsForRegistration } from "@/lib/checkin";
import { eligibleEntrants, getSubmissions, roundOpenForSubmissions } from "@/lib/judging";
import { noticeHtml, sendMail } from "@/lib/mailer";
import {
  EMAIL_PATTERN,
  captchaFailed,
  cleanText,
  hmac,
  limitByIp,
  rateLimit,
  safeEqual,
  signPass,
  tooManyRequests,
  verifyTurnstile,
} from "@/lib/security";
import { VISITOR_COOKIE, getVisitorEmail, visitorCookie } from "@/lib/visitor";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });

async function buildProfile(email: string) {
  const redis = getRedis();
  const [registrations, events, metaById, series] = await Promise.all([
    registrationsForEmail(email),
    getEvents<SheetEvent>(),
    readAllEventMeta(),
    readSeries(),
  ]);
  const eventsById = new Map(events.map((e) => [e.id, e]));

  const passes = await Promise.all(
    registrations.map(async (reg) => {
      const event = eventsById.get(reg.eventId);
      const meta = metaById[reg.eventId];
      const [cancelled, checkins, team] = await Promise.all([
        isCancelled(reg.eventId, reg.regId),
        checkinsForRegistration(reg.eventId, reg.regId),
        meta?.team.enabled ? getTeamForMember(reg.eventId, email) : Promise.resolve(null),
      ]);

      // Competition rounds this person (or their team) can submit to
      const rounds = [];
      if (meta && meta.rounds.length > 0 && !cancelled) {
        const entrantId = meta.team.enabled ? team?.id : reg.regId;
        for (const round of meta.rounds) {
          const eligible = entrantId ? (await eligibleEntrants(reg.eventId, meta, round.id)).some((e) => e.id === entrantId) : false;
          const submissions = entrantId ? await getSubmissions(reg.eventId, round.id) : {};
          rounds.push({
            id: round.id,
            name: round.name,
            submissionLabel: round.submissionLabel,
            closesAt: round.submissionsCloseAt || null,
            open: eligible && roundOpenForSubmissions(round),
            eligible,
            submission: entrantId ? submissions[entrantId] || null : null,
          });
        }
      }

      return {
        regId: reg.regId,
        passCode: signPass(reg.regId),
        eventId: reg.eventId,
        eventTitle: event?.title || reg.eventTitle,
        eventDate: event?.date || "",
        eventStatus: event?.status || "PAST",
        slug: event ? eventSlug(event, meta) : null,
        venue: meta?.venue || null,
        cancelled,
        checkins,
        team: team ? { name: team.name, code: team.code, members: team.members.map((m) => m.name), isLeader: team.leaderEmail === email } : null,
        rounds,
      };
    }),
  );

  const waitlisted: { eventId: string; eventTitle: string }[] = [];
  if (redis) {
    for (const event of events.filter((e) => e.status === "ACTIVE" && metaById[e.id]?.waitlist)) {
      if (await redis.hexists(KEYS.waitlist(event.id), email)) waitlisted.push({ eventId: event.id, eventTitle: event.title });
    }
  }

  const seriesProgress = await Promise.all(
    series.map(async (s) => {
      const attended = redis
        ? (await Promise.all(s.eventIds.map((id) => redis.sismember(KEYS.attended(id), email)))).filter(Boolean).length
        : 0;
      const registeredIn = s.eventIds.filter((id) => registrations.some((r) => r.eventId === id)).length;
      return { id: s.id, title: s.title, total: s.eventIds.length, required: s.requiredCount || s.eventIds.length, attended, registeredIn };
    }),
  );

  let recruitment = null;
  try {
    const data = await sheetGet("check-student-result", { email }, { cache: "no-store" });
    if (data?.success && data.status) recruitment = { status: String(data.status).toUpperCase(), name: data.name || "" };
  } catch {
    // Recruitment lookup is a nice-to-have here
  }

  return {
    email,
    passes: passes.sort((a, b) => String(b.eventDate).localeCompare(String(a.eventDate))),
    waitlisted,
    series: seriesProgress.filter((s) => s.registeredIn > 0 || s.attended > 0),
    recruitment,
  };
}

export async function GET() {
  const email = await getVisitorEmail();
  if (!email) return json({ success: true, signedIn: false });
  try {
    return json({ success: true, signedIn: true, profile: await buildProfile(email) });
  } catch (error) {
    console.error("My E-Cell profile failed:", error);
    return json({ success: false, error: "We couldn't load your details right now." }, 500);
  }
}

async function ownedRegistration(email: string, regId: string) {
  return (await registrationsForEmail(email)).find((r) => r.regId === regId) || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = body.action;

  if (action === "send-code") {
    const limited = await limitByIp(request, "me-code", 8, 900);
    if (limited) return limited;
    if (!(await verifyTurnstile(body.captchaToken, request))) return captchaFailed();
    const email = cleanText(body.email, 200).toLowerCase();
    if (!EMAIL_PATTERN.test(email)) return json({ success: false, error: "Please enter a valid email address." }, 400);
    const perEmail = await rateLimit("me-code-email", email, 3, 900);
    if (!perEmail.ok) return tooManyRequests(perEmail.retryAfter);

    const redis = getRedis();
    if (!redis) return json({ success: false, error: "Sign-in isn't available right now." }, 503);
    const code = String(randomInt(100000, 1000000));
    await redis.set(KEYS.loginCode(email), { hash: hmac(`code:${email}:${code}`), tries: 0 }, { ex: 600 });
    try {
      await sendMail({
        to: email,
        subject: `${code} is your E-Cell sign-in code`,
        text: `Your E-Cell sign-in code is ${code}. It expires in 10 minutes.`,
        html: noticeHtml("Your sign-in code", [
          `Use this code to open My E-Cell: ${code}`,
          "It expires in 10 minutes. If you didn't ask for it, you can ignore this email.",
        ]),
      });
    } catch (error) {
      console.error("Login code email failed:", error);
      return json({ success: false, error: "We couldn't send the code. Please try again in a minute." }, 502);
    }
    return json({ success: true });
  }

  if (action === "verify-code") {
    const limited = await limitByIp(request, "me-verify", 20, 900);
    if (limited) return limited;
    const email = cleanText(body.email, 200).toLowerCase();
    const code = cleanText(body.code, 10);
    const redis = getRedis();
    if (!redis) return json({ success: false, error: "Sign-in isn't available right now." }, 503);
    const stored = await redis.get<{ hash: string; tries: number }>(KEYS.loginCode(email));
    if (!stored) return json({ success: false, error: "That code has expired. Please ask for a new one." }, 400);
    if (stored.tries >= 5) {
      await redis.del(KEYS.loginCode(email));
      return json({ success: false, error: "Too many wrong tries. Please ask for a new code." }, 400);
    }
    if (!safeEqual(stored.hash, hmac(`code:${email}:${code}`))) {
      await redis.set(KEYS.loginCode(email), { ...stored, tries: stored.tries + 1 }, { keepTtl: true });
      return json({ success: false, error: "That code isn't right. Check the email and try again." }, 400);
    }
    await redis.del(KEYS.loginCode(email));
    const cookie = visitorCookie(email);
    const response = json({ success: true });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  }

  if (action === "sign-out") {
    const response = json({ success: true });
    response.cookies.set(VISITOR_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  // Everything below needs a signed-in student
  const email = await getVisitorEmail();
  if (!email) return json({ success: false, error: "Please sign in again." }, 401);

  if (action === "resend-pass") {
    const regId = cleanText(body.regId, 80);
    const limit = await rateLimit("resend", regId, 3, 3600);
    if (!limit.ok) return tooManyRequests(limit.retryAfter);
    const reg = await ownedRegistration(email, regId);
    if (!reg) return json({ success: false, error: "That pass isn't on your account." }, 404);
    const event = (await getEvents<SheetEvent>()).find((e) => e.id === reg.eventId);
    const meta = (await readAllEventMeta())[reg.eventId];
    try {
      await sendPass(event || { title: reg.eventTitle, date: "" }, meta, reg);
    } catch (error) {
      console.error("Resend pass failed:", error);
      return json({ success: false, error: "We couldn't send the email. Show the QR on this page at the gate instead." }, 502);
    }
    return json({ success: true });
  }

  if (action === "cancel") {
    const regId = cleanText(body.regId, 80);
    const reg = await ownedRegistration(email, regId);
    if (!reg) return json({ success: false, error: "That pass isn't on your account." }, 404);
    const event = (await getEvents<SheetEvent>()).find((e) => e.id === reg.eventId);
    if (!event || event.status !== "ACTIVE") return json({ success: false, error: "This event has already finished." }, 400);
    await cancelRegistration(reg);
    const meta = (await readAllEventMeta())[reg.eventId];
    if (meta?.waitlist) after(() => promoteFromWaitlist(event, meta).then(() => undefined).catch((err) => console.error(err)));
    return json({ success: true });
  }

  if (action === "submit-entry") {
    const eventId = cleanText(body.eventId, 60);
    const roundId = cleanText(body.roundId, 60);
    const link = cleanText(body.link, 500);
    const note = cleanText(body.note, 500);
    if (!/^https:\/\/\S+$/.test(link)) return json({ success: false, error: "Please paste a full https:// link." }, 400);

    const meta = (await readAllEventMeta())[eventId];
    const round = meta?.rounds.find((r) => r.id === roundId);
    if (!meta || !round) return json({ success: false, error: "That round doesn't exist." }, 404);
    if (!roundOpenForSubmissions(round)) return json({ success: false, error: "Submissions for this round are closed." }, 400);

    const regs = (await registrationsForEmail(email)).filter((r) => r.eventId === eventId);
    const active = [];
    for (const r of regs) if (!(await isCancelled(eventId, r.regId))) active.push(r);
    if (active.length === 0) return json({ success: false, error: "You're not registered for this event." }, 403);
    const entrantId = meta.team.enabled ? (await getTeamForMember(eventId, email))?.id : active[0].regId;
    if (!entrantId) return json({ success: false, error: "Join a team before submitting." }, 400);
    const eligible = (await eligibleEntrants(eventId, meta, roundId)).some((e) => e.id === entrantId);
    if (!eligible) return json({ success: false, error: "Your entry isn't in this round." }, 403);

    const redis = getRedis();
    if (!redis) return json({ success: false, error: "Submissions aren't available right now." }, 503);
    await redis.hset(KEYS.submissions(eventId, roundId), { [entrantId]: { link, note, at: new Date().toISOString(), by: email } });
    return json({ success: true });
  }

  return json({ success: false, error: "Unknown action." }, 400);
}
