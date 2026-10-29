import HomeView from "@/components/HomeView";
import { getTeam } from "@/lib/content";

export default async function Home() {
  const team = await getTeam();
  return <HomeView team={team} />;
}
