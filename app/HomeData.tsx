import { getLineageNodes, getSchoolsWithPhilosophers } from "@/sanity/queries";
import HomeClient from "./HomeClient";

export default async function HomeData() {
  const [nodes, schools] = await Promise.all([
    getLineageNodes(),
    getSchoolsWithPhilosophers(),
  ]);
  return <HomeClient nodes={nodes} schools={schools} />;
}
