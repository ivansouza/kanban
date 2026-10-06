import { dayKeyFromNow, isoFromNow } from "@/lib/dates";

export type Priority = "urgent" | "normal" | "low";

export type ColumnKind =
  | "todo"
  | "in-progress"
  | "done"
  | "backlog"
  | "canceled"
  | "duplicated";

export type Member = { id: string; name: string };

export type Column = {
  id: string;
  name: string;
  kind: ColumnKind;
  hidden: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: Priority;
  assigneeIds: string[];
  createdAt: string;
  dueDate: string | null;
};

export type Activity = { id: string; text: string; at: string };

export type BoardData = {
  title: string;
  favorite: boolean;
  teamName: string;
  githubConnected: boolean;
  members: Member[];
  columns: Column[];
  tasks: Task[];
  activity: Activity[];
};

export const CURRENT_USER_ID = "mark";

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgente" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Baixa" },
];

export const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 0,
  normal: 1,
  low: 2,
};

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}

export function memberLabel(task: Task, members: Member[]) {
  const names = task.assigneeIds
    .map((id) => members.find((member) => member.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "Sem responsável";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

export function crewLabel(task: Task, teamName: string) {
  const count = task.assigneeIds.length;
  const singular = teamName.replace(/^\d+\s*/, "").replace(/s$/, "");
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function task(
  id: string,
  title: string,
  columnId: string,
  priority: Priority,
  assigneeIds: string[],
  createdDaysAgo: number,
  dueInDays: number | null,
  description = "",
): Task {
  return {
    id,
    title,
    description,
    columnId,
    priority,
    assigneeIds,
    createdAt: isoFromNow(-createdDaysAgo),
    dueDate: dueInDays === null ? null : dayKeyFromNow(dueInDays),
  };
}

export function seedData(): BoardData {
  return {
    title: "Painel de tarefas e fluxo",
    favorite: false,
    teamName: "Três mosqueteiros",
    githubConnected: false,
    members: [
      { id: "mark", name: "Marcos" },
      { id: "andrew", name: "André" },
      { id: "jimmy", name: "Jaime" },
    ],
    columns: [
      { id: "todo", name: "A fazer", kind: "todo", hidden: false },
      {
        id: "in-progress",
        name: "Em andamento",
        kind: "in-progress",
        hidden: false,
      },
      { id: "done", name: "Feito", kind: "done", hidden: false },
      { id: "backlog", name: "Backlog", kind: "backlog", hidden: true },
      { id: "canceled", name: "Cancelado", kind: "canceled", hidden: true },
      {
        id: "duplicated",
        name: "Duplicado",
        kind: "duplicated",
        hidden: true,
      },
    ],
    tasks: [
      task(
        "t1",
        "Preparar o roadmap do 2º trimestre",
        "todo",
        "urgent",
        ["mark", "andrew"],
        39,
        19,
        "Juntar o que design, engenharia e vendas pediram antes do planejamento.",
      ),
      task(
        "t2",
        "Atualizar os componentes do design system",
        "todo",
        "normal",
        ["andrew"],
        40,
        8,
      ),
      task(
        "t3",
        "Escrever o resumo de alinhamento",
        "in-progress",
        "urgent",
        ["andrew", "mark", "jimmy"],
        39,
        -3,
      ),
      task(
        "t4",
        "Revisar o texto da homepage para o lançamento",
        "in-progress",
        "low",
        ["andrew", "mark", "jimmy"],
        39,
        -1,
      ),
      task(
        "t5",
        "Validar as melhorias de acessibilidade",
        "in-progress",
        "normal",
        ["jimmy", "andrew", "mark"],
        52,
        6,
      ),
      task(
        "t6",
        "Configurar o painel de analytics",
        "in-progress",
        "normal",
        ["mark", "andrew", "jimmy"],
        59,
        8,
      ),
      task(
        "t7",
        "Definir as métricas de sucesso (KPIs)",
        "in-progress",
        "urgent",
        ["andrew", "mark", "jimmy"],
        57,
        -2,
      ),
      task(
        "t8",
        "Publicar a sequência de e-mails de boas-vindas",
        "done",
        "normal",
        ["andrew"],
        39,
        0,
      ),
      task(
        "t9",
        "Migrar a autenticação para o SDK novo",
        "done",
        "normal",
        ["mark", "andrew", "jimmy"],
        39,
        -4,
      ),
      task(
        "t10",
        "Escrever as notas da versão 2.4",
        "done",
        "normal",
        ["andrew", "jimmy", "mark"],
        39,
        0,
      ),
      task(
        "t11",
        "Explorar triagem de tarefas com IA",
        "backlog",
        "low",
        ["jimmy"],
        10,
        null,
      ),
      task(
        "t12",
        "Atualizar as ilustrações da página de preços",
        "backlog",
        "low",
        [],
        5,
        null,
      ),
      task(
        "t13",
        "Montar as notificações do Slack v1",
        "canceled",
        "normal",
        ["mark"],
        30,
        null,
      ),
    ],
    activity: [
      {
        id: "a1",
        text: "André moveu “Publicar a sequência de e-mails de boas-vindas” para Feito",
        at: isoFromNow(-1),
      },
      {
        id: "a2",
        text: "Marcos criou “Preparar o roadmap do 2º trimestre”",
        at: isoFromNow(-2),
      },
      {
        id: "a3",
        text: "Jaime marcou “Revisar o texto da homepage para o lançamento” como prioridade baixa",
        at: isoFromNow(-3),
      },
    ],
  };
}
