"use client";

import { useDroppable } from "@dnd-kit/core";
import TaskCardView, {
  type TaskCardViewProps,
} from "@/components/dashboard/board/task-card-view";

type DropSlotProps = Pick<
  TaskCardViewProps,
  "task" | "column" | "members" | "teamName" | "display"
>;

export default function DropSlot(props: DropSlotProps) {
  const { setNodeRef } = useDroppable({
    id: "drop-slot",
    data: { type: "slot" },
  });

  return (
    <div
      ref={setNodeRef}
      aria-hidden
      className="border-border bg-secondary rounded-2xl border border-dashed"
    >
      <TaskCardView {...props} invisible />
    </div>
  );
}
