import { ImageResponse } from "next/og";
import { findEventBySlug, formatIst } from "@/lib/eventLookup";

export const alt = "BIMTECH E-Cell event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview card for an event page, in the site's black-and-gold look
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findEventBySlug(slug);
  const title = found?.event.title || "BIMTECH E-Cell";
  const meta = found?.meta;
  const date = meta?.startsAt ? formatIst(meta.startsAt, { dateStyle: "long" }) : found?.event.date || "";
  const line = [date, meta?.venue].filter(Boolean).join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 30%, rgba(245,158,11,0.35), transparent 55%), #05050a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#fcd34d", textTransform: "uppercase" }}>BIMTECH E-Cell</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: title.length > 40 ? 68 : 88, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          {meta?.tagline && <div style={{ fontSize: 32, color: "rgba(255,255,255,0.75)" }}>{meta.tagline}</div>}
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)" }}>{line}</div>
      </div>
    ),
    size,
  );
}
