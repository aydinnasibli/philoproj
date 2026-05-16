import { getLineageNodes } from "@/lib/sanity/queries";
import HomeClient from "./HomeClient";

export default async function HomeData() {
  const nodes = await getLineageNodes();
  return <HomeClient nodes={nodes} />;
}
