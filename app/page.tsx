import Dashboard from "@/components/dashboard/dashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Painel de tarefas e fluxo - Kanbaaan",
  description:
    "Acompanhe tarefas em A fazer, Em andamento e Feito, com arrastar e soltar, filtros e responsáveis.",
  path: "/",
});

export default function Home() {
  return (
    <main className="h-dvh max-w-full overflow-hidden">
      <Dashboard />
    </main>
  );
}
