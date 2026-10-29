import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings, getTeam } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Boards | BIMTECH E-Cell",
  description: "The students and mentors who have run BIMTECH E-Cell, year by year.",
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter((part) => !part.endsWith("."))
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

export default async function TeamPage() {
  const [team, settings] = await Promise.all([getTeam(), getSiteSettings()]);
  const tenures = [...new Set(team.map((m) => m.tenure || "Earlier"))].sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen text-white py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-14">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <p className="text-[10px] font-mono tracking-widest uppercase text-accent-300">{"// The people behind E-Cell"}</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Our boards</h1>
          <p className="text-sm text-white/60 max-w-xl">Every year a new board takes over. Here is the current one and the ones that came before.</p>
        </header>

        {tenures.map((tenure) => {
          const members = team.filter((m) => (m.tenure || "Earlier") === tenure);
          return (
            <section key={tenure} className="space-y-5">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <h2 className="font-display text-xl font-bold">Board {tenure}</h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  {tenure === settings.currentTenure ? "Current board · " : ""}
                  {members.length} members
                </span>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((member) => (
                  <li key={member.id} className="rounded-xl border border-white/10 bg-space-900/60 overflow-hidden">
                    <div className="relative aspect-[4/5] bg-space-900">
                      {member.image ? (
                        <Image src={member.image} alt={member.name} fill sizes="(min-width: 1024px) 25vw, 50vw" unoptimized={member.image.startsWith("http")} className="object-cover object-[50%_25%]" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-display font-bold text-white/50">{initials(member.name)}</div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-bold leading-tight">{member.name}</p>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-accent-100/70">{member.role}</p>
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/60 hover:text-accent-300 transition-colors">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
