import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createId,
  seedData,
  PRIORITY_RANK,
  type BoardData,
  type Priority,
  type Task,
} from "@/lib/kanban";

export type TaskInput = {
  title: string;
  description?: string;
  columnId: string;
  priority?: Priority;
  assigneeIds?: string[];
  dueDate?: string | null;
};

type KanbanState = BoardData & {
  hydrated: boolean;
  setHydrated: () => void;
  setTitle: (title: string) => void;
  toggleFavorite: () => void;
  toggleGithub: () => void;
  addMember: (name: string) => void;
  addTask: (input: TaskInput) => string;
  importTasks: (titles: string[], columnId: string) => number;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, columnId: string, beforeId: string | null) => void;
  sortColumn: (columnId: string, by: "priority" | "due") => void;
  renameColumn: (id: string, name: string) => void;
  setColumnHidden: (id: string, hidden: boolean) => void;
  showAllColumns: () => void;
  reset: () => void;
};

const MAX_ACTIVITY = 60;

function withActivity(activity: BoardData["activity"], text: string) {
  return [
    { id: createId(), text, at: new Date().toISOString() },
    ...activity,
  ].slice(0, MAX_ACTIVITY);
}

function insertAt(
  tasks: Task[],
  moving: Task,
  columnId: string,
  beforeId: string | null,
) {
  const rest = tasks.filter((task) => task.id !== moving.id);
  const moved = { ...moving, columnId };
  const inColumn = rest.filter((task) => task.columnId === columnId);
  const target = beforeId ? rest.find((task) => task.id === beforeId) : null;
  if (target && target.columnId === columnId) {
    const at = rest.indexOf(target);
    return [...rest.slice(0, at), moved, ...rest.slice(at)];
  }
  if (inColumn.length === 0) return [...rest, moved];
  const last = inColumn[inColumn.length - 1];
  const at = rest.indexOf(last) + 1;
  return [...rest.slice(0, at), moved, ...rest.slice(at)];
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      ...seedData(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setTitle: (title) => set({ title: title.trim() || get().title }),
      toggleFavorite: () => set((state) => ({ favorite: !state.favorite })),
      toggleGithub: () =>
        set((state) => ({ githubConnected: !state.githubConnected })),
      addMember: (name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed) return state;
          const id = createId();
          return {
            members: [...state.members, { id, name: trimmed }],
            activity: withActivity(
              state.activity,
              `${trimmed} joined ${state.teamName}`,
            ),
          };
        }),
      addTask: (input) => {
        const id = createId();
        set((state) => {
          const task: Task = {
            id,
            title: input.title.trim(),
            description: input.description?.trim() ?? "",
            columnId: input.columnId,
            priority: input.priority ?? "normal",
            assigneeIds: input.assigneeIds ?? [],
            createdAt: new Date().toISOString(),
            dueDate: input.dueDate ?? null,
          };
          return {
            tasks: [...state.tasks, task],
            activity: withActivity(
              state.activity,
              `You created “${task.title}”`,
            ),
          };
        });
        return id;
      },
      importTasks: (titles, columnId) => {
        const clean = titles.map((title) => title.trim()).filter(Boolean);
        if (clean.length === 0) return 0;
        set((state) => ({
          tasks: [
            ...state.tasks,
            ...clean.map<Task>((title) => ({
              id: createId(),
              title,
              description: "",
              columnId,
              priority: "normal",
              assigneeIds: [],
              createdAt: new Date().toISOString(),
              dueDate: null,
            })),
          ],
          activity: withActivity(
            state.activity,
            `You imported ${clean.length} issue${clean.length === 1 ? "" : "s"}`,
          ),
        }));
        return clean.length;
      },
      updateTask: (id, patch) =>
        set((state) => {
          const current = state.tasks.find((task) => task.id === id);
          if (!current) return state;
          const next = { ...current, ...patch };
          let activity = state.activity;
          if (patch.columnId && patch.columnId !== current.columnId) {
            const column = state.columns.find((c) => c.id === patch.columnId);
            activity = withActivity(
              activity,
              `You moved “${next.title}” to ${column?.name ?? "another column"}`,
            );
          } else if (patch.priority && patch.priority !== current.priority) {
            activity = withActivity(
              activity,
              `You set “${next.title}” to ${patch.priority} priority`,
            );
          } else {
            activity = withActivity(activity, `You updated “${next.title}”`);
          }
          const tasks =
            patch.columnId && patch.columnId !== current.columnId
              ? insertAt(state.tasks, next, patch.columnId, null)
              : state.tasks.map((task) => (task.id === id ? next : task));
          return { tasks, activity };
        }),
      deleteTask: (id) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id);
          if (!task) return state;
          return {
            tasks: state.tasks.filter((item) => item.id !== id),
            activity: withActivity(
              state.activity,
              `You deleted “${task.title}”`,
            ),
          };
        }),
      moveTask: (id, columnId, beforeId) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id);
          if (!task) return state;
          const tasks = insertAt(state.tasks, task, columnId, beforeId);
          if (task.columnId === columnId) return { tasks };
          const column = state.columns.find((c) => c.id === columnId);
          return {
            tasks,
            activity: withActivity(
              state.activity,
              `You moved “${task.title}” to ${column?.name ?? columnId}`,
            ),
          };
        }),
      sortColumn: (columnId, by) =>
        set((state) => {
          const inColumn = state.tasks.filter((t) => t.columnId === columnId);
          const sorted = [...inColumn].sort((a, b) => {
            if (by === "priority") {
              return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
            }
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          });
          let cursor = 0;
          return {
            tasks: state.tasks.map((task) =>
              task.columnId === columnId ? sorted[cursor++] : task,
            ),
          };
        }),
      renameColumn: (id, name) =>
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === id && name.trim()
              ? { ...column, name: name.trim() }
              : column,
          ),
        })),
      setColumnHidden: (id, hidden) =>
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === id ? { ...column, hidden } : column,
          ),
        })),
      showAllColumns: () =>
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            hidden: false,
          })),
        })),
      reset: () => set({ ...seedData() }),
    }),
    {
      name: "kanbaaan-board",
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
      partialize: (state) => ({
        title: state.title,
        favorite: state.favorite,
        teamName: state.teamName,
        githubConnected: state.githubConnected,
        members: state.members,
        columns: state.columns,
        tasks: state.tasks,
        activity: state.activity,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
