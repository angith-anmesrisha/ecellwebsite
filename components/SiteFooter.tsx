import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/alumni", label: "Alumni" },
  { href: "/graveyard", label: "Archive" },
  { href: "/results", label: "Results" },
  { href: "/recruitment", label: "Apply" },
];

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/ecell_bimtech", label: "Instagram" },
  { href: "https://www.linkedin.com/in/e-cell-bimtech-57b2231a/", label: "LinkedIn" },
  { href: "mailto:ecell@bimtech.ac.in", label: "ecell@bimtech.ac.in" },
];

// Shared footer for every page except the home page, which has its own contact section
export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-10">
        <div className="space-y-3 max-w-sm">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
            BIMTECH E-Cell
          </Link>
          <p className="text-sm text-white/60 leading-relaxed">
            The Entrepreneurship Cell of Birla Institute of Management Technology. Where aspiration meets opportunity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <nav aria-label="Footer" className="flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-white/60 hover:text-accent-300 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-8 flex justify-between text-xs text-white/60 font-mono">
        <span>© {new Date().getFullYear()} BIMTECH E-Cell</span>
        <Link href="/admin" className="hover:text-accent-300 transition-colors">
          Console Login
        </Link>
      </div>
    </footer>
  );
}
