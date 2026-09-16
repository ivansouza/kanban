"use client";

import { useCallback, type KeyboardEvent } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";
import TaskCardView, {
  type TaskCardViewProps,
} from "@/components/dashboard/board/task-card-view";
import { wasJustDragged } from "@/components/dashboard/board/board-drag";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type TaskCardProps = Omit<
  TaskCardViewProps,
  "interactive" | "lifted" | "onMoveToTop" | "className"
> & { hidden?: boolean; animateLayout?: boolean };

export default function TaskCard({
  hidden = false,
  animateLayout = true,
  ...view
}: TaskCardProps) {
  const { task } = view;
  const openDialog = useUiStore((state) => state.openDialog);
  const moveToTop = useKanbanStore((state) => state.moveToTop);
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: task.id, data: { type: "task", task } });
  const { setNodeRef: setDropRef } = useDroppable({
    id: `task:${task.id}`,
    data: { type: "task", taskId: task.id, columnId: task.columnId },
  });

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef],
  );

  const open = () => {
    if (wasJustDragged()) return;
    openDialog({ type: "task", taskId: task.id });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  return (
    <motion.div
      layout={animateLayout ? "position" : false}
      transition={{ layout: { type: "spring", duration: 0.3, bounce: 0 } }}
    >
      <div
        ref={setRef}
        {...listeners}
        {...attributes}
        aria-label={`Open ${task.title}`}
        onClick={open}
        onKeyDown={onKeyDown}
        className={cn(
          "focus-visible:shadow-focus cursor-grab touch-manipulation rounded-2xl outline-none",
          isDragging && "cursor-grabbing",
        )}
      >
        <TaskCardView
          {...view}
          interactive
          invisible={hidden}
          onMoveToTop={() => moveToTop(task.id)}
          className="ease-power2-out hover:shadow-card-hover transition-shadow duration-150"
        />
      </div>
    </motion.div>
  );
}
