import Link from "next/link";
import type { Metadata } from "next";
import LostInSpace from "@/components/LostInSpace";

export const metadata: Metadata = {
  title: "Page not found | BIMTECH E-Cell",
};

export default function NotFound() {
  return (
    <LostInSpace
      code="404"
      title="This page drifted past the event horizon"
      body="The link may be broken, or the page has moved. Let's get you back on course."
      action={
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-accent-100 transition-colors"
        >
          Back to home
        </Link>
      }
    />
  );
}
