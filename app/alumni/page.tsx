import type { Metadata } from "next";
import AlumniDirectory, { type Alumnus } from "@/components/AlumniDirectory";
import { getAlumni } from "@/lib/sheets";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Alumni Mentorship Directory | BIMTECH E-Cell",
  description: "Connect with BIMTECH E-Cell alumni working in startups, venture capital and industry.",
};

export default async function AlumniPage() {
  const alumni = await getAlumni<Alumnus>();
  return <AlumniDirectory initialAlumni={alumni} />;
}
