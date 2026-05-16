import { getSchoolsWithPhilosophers } from "@/lib/sanity/queries";
import LineageCanvasErrorBoundary from "@/components/lineage/LineageCanvasErrorBoundary";

export default async function LineageData() {
  const schools = await getSchoolsWithPhilosophers();
  return <LineageCanvasErrorBoundary schools={schools} />;
}
