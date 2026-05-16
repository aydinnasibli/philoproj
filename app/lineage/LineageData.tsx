import { getSchoolsWithPhilosophers } from "@/lib/sanity/queries";
import LineageCanvas from "@/components/lineage/LineageCanvas";

export default async function LineageData() {
  const schools = await getSchoolsWithPhilosophers();
  return <LineageCanvas schools={schools} />;
}
