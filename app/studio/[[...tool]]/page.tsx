import dynamic from "next/dynamic";

const StudioClient = dynamic(() => import("@/components/StudioClient"), { ssr: false });

export default function StudioPage() {
  return <StudioClient />;
}
