import type { ComponentType, SVGProps } from "react";
import type { ColumnKind, Priority } from "@/lib/kanban";
import type { BadgeTone } from "@/components/_common/status-badge";
import ListIcon from "@/public/assets/images/_common/icons/list.svg";
import ContrastIcon from "@/public/assets/images/_common/icons/contrast-02.svg";
import ClipboardCheckIcon from "@/public/assets/images/_common/icons/clipboard-check.svg";
import LoadingIcon from "@/public/assets/images/_common/icons/loading-02.svg";
import XCloseIcon from "@/public/assets/images/_common/icons/x-close.svg";
import IntersectCircleIcon from "@/public/assets/images/_common/icons/intersect-circle.svg";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type ColumnMeta = { icon: Icon; tone: BadgeTone; color: string };

export const COLUMN_META: Record<ColumnKind, ColumnMeta> = {
  todo: { icon: ListIcon, tone: "neutral", color: "text-icon" },
  "in-progress": { icon: ContrastIcon, tone: "info", color: "text-info" },
  done: { icon: ClipboardCheckIcon, tone: "success", color: "text-success" },
  backlog: { icon: LoadingIcon, tone: "neutral", color: "text-icon" },
  canceled: { icon: XCloseIcon, tone: "neutral", color: "text-icon" },
  duplicated: {
    icon: IntersectCircleIcon,
    tone: "neutral",
    color: "text-icon",
  },
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: "text-warning",
  normal: "text-info",
  low: "text-success",
};
