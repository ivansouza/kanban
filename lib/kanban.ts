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
  { value: "urgent", label: "Urgent" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
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
  if (names.length === 0) return "Unassigned";
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
    title: "Task Progress & Workflow Dashboard",
    favorite: false,
    teamName: "3 Musketeers",
    githubConnected: false,
    members: [
      { id: "mark", name: "Mark" },
      { id: "andrew", name: "Andrew" },
      { id: "jimmy", name: "Jimmy" },
    ],
    columns: [
      { id: "todo", name: "To do", kind: "todo", hidden: false },
      {
        id: "in-progress",
        name: "In progress",
        kind: "in-progress",
        hidden: false,
      },
      { id: "done", name: "Done", kind: "done", hidden: false },
      { id: "backlog", name: "Backlog", kind: "backlog", hidden: true },
      { id: "canceled", name: "Canceled", kind: "canceled", hidden: true },
      {
        id: "duplicated",
        name: "Duplicated",
        kind: "duplicated",
        hidden: true,
      },
    ],
    tasks: [
      task(
        "t1",
        "Prepare Q2 product roadmap",
        "todo",
        "urgent",
        ["mark", "andrew"],
        39,
        19,
        "Collect input from design, engineering and sales before the planning offsite.",
      ),
      task(
        "t2",
        "Update design system components",
        "todo",
        "normal",
        ["andrew"],
        40,
        8,
      ),
      task(
        "t3",
        "Create alignment summary document",
        "in-progress",
        "urgent",
        ["andrew", "mark", "jimmy"],
        39,
        -3,
      ),
      task(
        "t4",
        "Review homepage copy for launch",
        "in-progress",
        "low",
        ["andrew", "mark", "jimmy"],
        39,
        -1,
      ),
      task(
        "t5",
        "Validate accessibility improvements",
        "in-progress",
        "normal",
        ["jimmy", "andrew", "mark"],
        52,
        6,
      ),
      task(
        "t6",
        "Configure analytics dashboard",
        "in-progress",
        "normal",
        ["mark", "andrew", "jimmy"],
        59,
        8,
      ),
      task(
        "t7",
        "Define success metrics (KPIs)",
        "in-progress",
        "urgent",
        ["andrew", "mark", "jimmy"],
        57,
        -2,
      ),
      task(
        "t8",
        "Ship onboarding email sequence",
        "done",
        "normal",
        ["andrew"],
        39,
        0,
      ),
      task(
        "t9",
        "Migrate auth to the new SDK",
        "done",
        "normal",
        ["mark", "andrew", "jimmy"],
        39,
        -4,
      ),
      task(
        "t10",
        "Write release notes for v2.4",
        "done",
        "normal",
        ["andrew", "jimmy", "mark"],
        39,
        0,
      ),
      task(
        "t11",
        "Explore AI-assisted issue triage",
        "backlog",
        "low",
        ["jimmy"],
        10,
        null,
      ),
      task(
        "t12",
        "Refresh pricing page illustrations",
        "backlog",
        "low",
        [],
        5,
        null,
      ),
      task(
        "t13",
        "Build Slack notifications v1",
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
        text: "Andrew moved “Ship onboarding email sequence” to Done",
        at: isoFromNow(-1),
      },
      {
        id: "a2",
        text: "Mark created “Prepare Q2 product roadmap”",
        at: isoFromNow(-2),
      },
      {
        id: "a3",
        text: "Jimmy set “Review homepage copy for launch” to Low priority",
        at: isoFromNow(-3),
      },
    ],
  };
}
