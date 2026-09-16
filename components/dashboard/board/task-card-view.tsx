"use client";

import Button from "@/components/_ui/button";
import TaskChips from "@/components/dashboard/board/task-chips";
import { COLUMN_META } from "@/components/_common/column-meta";
import type { Display } from "@/stores/ui-store";
import { crewLabel, type Column, type Member, type Task } from "@/lib/kanban";
import { formatShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import ArrowUpIcon from "@/public/assets/images/_common/icons/arrow-narrow-up.svg";

export type TaskCardViewProps = {
  task: Task;
  column: Column;
  members: Member[];
  teamName: string;
  display: Display;
  interactive?: boolean;
  lifted?: boolean;
  invisible?: boolean;
  isFirst?: boolean;
  onMoveToTop?: () => void;
  className?: string;
};

export default function TaskCardView({
  task,
  column,
  members,
  teamName,
  display,
  interactive = false,
  lifted = false,
  invisible = false,
  isFirst = false,
  onMoveToTop,
  className,
}: TaskCardViewProps) {
  const meta = COLUMN_META[column.kind];
  const Icon = meta.icon;
  const showTop = interactive && Boolean(onMoveToTop) && !isFirst;
  const showFooter = display.priority || display.assignees || display.due;

  return (
    <div
      className={cn(
        "group/card shadow-card relative flex w-full flex-col overflow-clip rounded-2xl bg-white",
        lifted && "shadow-card-lift -rotate-4",
        invisible && "invisible",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-2 p-4", showTop && "pr-12")}>
        <div className="flex items-start gap-1.5">
          <Icon
            aria-hidden
            className={cn("mt-[2px] size-3.5 shrink-0", meta.color)}
          />
          <h3 className="line-clamp-2 min-w-0 flex-1 break-words">
            {task.title}
          </h3>
        </div>
        {display.created && (
          <div className="text-subtle flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="whitespace-nowrap">
              Created {formatShort(task.createdAt)}
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden
                className="size-[3px] rounded-full bg-[#d9d9d9]"
              />
              {crewLabel(task, teamName)}
            </span>
          </div>
        )}
      </div>
      {showFooter && (
        <div className="border-card-border flex flex-wrap items-center gap-2 border-t p-4">
          <TaskChips
            task={task}
            column={column}
            members={members}
            display={display}
            interactive={interactive}
          />
        </div>
      )}
      {showTop && (
        <Button
          variant="primary"
          size="icon"
          aria-label="Move to top"
          title="Move to top"
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onMoveToTop?.();
          }}
          className="absolute top-3 right-3 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 focus-visible:opacity-100"
        >
          <ArrowUpIcon className="size-3.5" aria-hidden />
        </Button>
      )}
    </div>
  );
}
