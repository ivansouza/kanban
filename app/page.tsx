import Dashboard from "@/components/dashboard/dashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Task Progress & Workflow Dashboard - Kanbaaan",
  description:
    "Track issues across To do, In progress and Done with drag and drop, filters and team assignments.",
  path: "/",
});

export default function Home() {
  return (
    <main className="h-dvh max-w-full overflow-hidden">
      <Dashboard />
    </main>
  );
}
