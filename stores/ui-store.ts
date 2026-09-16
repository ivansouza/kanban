import { create } from "zustand";
import type { Priority } from "@/lib/kanban";

export type Tab = "overview" | "updates" | "issues";

export type NavId =
  | "inbox"
  | "my-issues"
  | "projects"
  | "views"
  | "more"
  | "team-issues"
  | "team-projects"
  | "team-views";

export type DialogState =
  | { type: "task"; taskId: string }
  | { type: "new-task"; columnId?: string }
  | { type: "import" }
  | { type: "invite" }
  | { type: "help" }
  | null;

export type Filter = {
  priority: Priority | null;
  assigneeId: string | null;
  overdue: boolean;
};

export type Display = {
  created: boolean;
  priority: boolean;
  assignees: boolean;
  due: boolean;
};

export const DISPLAY_OPTIONS: { key: keyof Display; label: string }[] = [
  { key: "created", label: "Created date" },
  { key: "priority", label: "Priority" },
  { key: "assignees", label: "Assignees" },
  { key: "due", label: "Due date" },
];

export type Toast = { id: number; title: string };

type UiState = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  panelOpen: boolean;
  panelSheetOpen: boolean;
  tab: Tab;
  nav: NavId;
  search: string;
  filter: Filter;
  display: Display;
  dialog: DialogState;
  dialogSession: number;
  toasts: Toast[];
  notificationsSeenAt: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  togglePanel: () => void;
  setPanelSheetOpen: (open: boolean) => void;
  setTab: (tab: Tab) => void;
  setNav: (nav: NavId) => void;
  setSearch: (search: string) => void;
  setFilter: (patch: Partial<Filter>) => void;
  clearFilter: () => void;
  setDisplay: (patch: Partial<Display>) => void;
  openDialog: (dialog: NonNullable<DialogState>) => void;
  closeDialog: () => void;
  toast: (title: string) => void;
  dismissToast: (id: number) => void;
  markNotificationsSeen: () => void;
};

const EMPTY_FILTER: Filter = {
  priority: null,
  assigneeId: null,
  overdue: false,
};

let toastCounter = 0;

export const useUiStore = create<UiState>()((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  panelOpen: true,
  panelSheetOpen: false,
  tab: "issues",
  nav: "team-issues",
  search: "",
  filter: EMPTY_FILTER,
  display: { created: true, priority: true, assignees: true, due: true },
  dialog: null,
  dialogSession: 0,
  toasts: [],
  notificationsSeenAt: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  setPanelSheetOpen: (panelSheetOpen) => set({ panelSheetOpen }),
  setTab: (tab) => set({ tab }),
  setNav: (nav) => set({ nav, sidebarOpen: false }),
  setSearch: (search) => set({ search }),
  setFilter: (patch) =>
    set((state) => ({ filter: { ...state.filter, ...patch } })),
  clearFilter: () => set({ filter: EMPTY_FILTER }),
  setDisplay: (patch) =>
    set((state) => ({ display: { ...state.display, ...patch } })),
  openDialog: (dialog) =>
    set((state) => ({ dialog, dialogSession: state.dialogSession + 1 })),
  closeDialog: () => set({ dialog: null }),
  toast: (title) => {
    const id = ++toastCounter;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, title }] }));
    window.setTimeout(() => get().dismissToast(id), 2600);
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  markNotificationsSeen: () =>
    set({ notificationsSeenAt: new Date().toISOString() }),
}));

export function isFilterActive(filter: Filter) {
  return Boolean(filter.priority || filter.assigneeId || filter.overdue);
}
