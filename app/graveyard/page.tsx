import type { Metadata } from "next";
import StartupGraveyard, { type FallenVenture } from "@/components/StartupGraveyard";
import { getGraveyard } from "@/lib/sheets";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Entrepreneurship Archive | BIMTECH E-Cell",
  description: "Case studies and lessons from student ventures that pivoted or shut down.",
};

export default async function GraveyardPage() {
  const failures = await getGraveyard<FallenVenture>();
  return <StartupGraveyard initialFailures={failures} />;
}
