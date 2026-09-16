"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "motion/react";
import BoardColumn from "@/components/dashboard/board/board-column";
import HiddenColumns from "@/components/dashboard/board/hidden-columns";
import TaskCardView from "@/components/dashboard/board/task-card-view";
import { taskMatches } from "@/components/dashboard/board/board-filters";
import {
  markDragEnd,
  type DropData,
  type Placement,
} from "@/components/dashboard/board/board-drag";
import Button from "@/components/_ui/button";
import { useKanbanStore } from "@/stores/kanban-store";
import { isFilterActive, useUiStore } from "@/stores/ui-store";
import type { Task } from "@/lib/kanban";
import { ease } from "@/lib/easings";
import { useMounted } from "@/hooks/use-mounted";

const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  if (within.length > 0) {
    const preferred = within.find((collision) => {
      const type = (
        collision.data?.droppableContainer?.data?.current as
          | DropData
          | undefined
      )?.type;
      return type !== "column";
    });
    return [preferred ?? within[0]];
  }
  return rectIntersection(args);
};

export default function Board({ mine = false }: { mine?: boolean }) {
  const columns = useKanbanStore((state) => state.columns);
  const tasks = useKanbanStore((state) => state.tasks);
  const members = useKanbanStore((state) => state.members);
  const teamName = useKanbanStore((state) => state.teamName);
  const moveTask = useKanbanStore((state) => state.moveTask);
  const search = useUiStore((state) => state.search);
  const filter = useUiStore((state) => state.filter);
  const clearFilter = useUiStore((state) => state.clearFilter);
  const setSearch = useUiStore((state) => state.setSearch);
  const display = useUiStore((state) => state.display);
  const panelOpen = useUiStore((state) => state.panelOpen);
  const panelSheetOpen = useUiStore((state) => state.panelSheetOpen);
  const setPanelSheetOpen = useUiStore((state) => state.setPanelSheetOpen);
  const toast = useUiStore((state) => state.toast);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [settledId, setSettledId] = useState<string | null>(null);
  const [dragCount, setDragCount] = useState(0);
  const placementRef = useRef<Placement | null>(null);
  const mounted = useMounted();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
  );

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) =>
        taskMatches(task, { search, filter, mine, columns }),
      ),
    [tasks, search, filter, mine, columns],
  );
  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    columns.forEach((column) => {
      map[column.id] = visibleTasks.filter(
        (task) => task.columnId === column.id,
      );
    });
    return map;
  }, [columns, visibleTasks]);
  const hiddenCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      counts[task.columnId] = (counts[task.columnId] ?? 0) + 1;
    });
    return counts;
  }, [tasks]);

  const visibleColumns = columns.filter((column) => !column.hidden);
  const hiddenColumns = columns.filter((column) => column.hidden);
  const activeTask = activeId
    ? (tasks.find((task) => task.id === activeId) ?? null)
    : null;
  const activeColumn = activeTask
    ? (columns.find((column) => column.id === activeTask.columnId) ?? null)
    : null;
  const filtering = isFilterActive(filter) || search.trim().length > 0 || mine;
  const nothingVisible =
    visibleTasks.length === 0 && tasks.length > 0 && filtering;

  const updatePlacement = useCallback((next: Placement | null) => {
    placementRef.current = next;
    setPlacement(next);
  }, []);

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setDragCount((count) => count + 1);
    updatePlacement(null);
  };

  const pointerFrom = (event: DragMoveEvent) => {
    const activator = event.activatorEvent as MouseEvent | TouchEvent | null;
    const touch =
      activator && "touches" in activator
        ? (activator.touches[0] ?? activator.changedTouches[0])
        : null;
    const originX = touch
      ? touch.clientX
      : ((activator as MouseEvent | null)?.clientX ?? 0);
    const originY = touch
      ? touch.clientY
      : ((activator as MouseEvent | null)?.clientY ?? 0);
    return { x: originX + event.delta.x, y: originY + event.delta.y };
  };

  const samePlacement = (a: Placement | null, b: Placement | null) =>
    a === b ||
    (a !== null &&
      b !== null &&
      a.columnId === b.columnId &&
      a.index === b.index &&
      a.hidden === b.hidden);

  const onDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over) {
      if (placementRef.current !== null) updatePlacement(null);
      return;
    }
    const data = over.data.current as DropData | undefined;
    if (!data) return;
    const id = String(active.id);
    let next: Placement | null;
    if (data.type === "hidden") {
      next = {
        columnId: data.columnId,
        index: Number.MAX_SAFE_INTEGER,
        beforeId: null,
        hidden: true,
      };
    } else {
      const columnId =
        data.type === "slot" ? placementRef.current?.columnId : data.columnId;
      if (!columnId) return;
      const pointer = pointerFrom(event);
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-column-id="${columnId}"] [data-task-card]`,
        ),
      ).filter((card) => card.dataset.taskCard !== id);
      let index = 0;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (pointer.y > rect.top + rect.height / 2) index += 1;
        else break;
      }
      next = {
        columnId,
        index,
        beforeId: cards[index]?.dataset.taskCard ?? null,
        hidden: false,
      };
    }
    if (!samePlacement(placementRef.current, next)) updatePlacement(next);
  };

  const finish = () => {
    markDragEnd();
    setActiveId(null);
    updatePlacement(null);
  };

  const onDragEnd = ({ active }: DragEndEvent) => {
    const target = placementRef.current;
    const id = String(active.id);
    const task = tasks.find((item) => item.id === id);
    if (task && target) {
      setSettledId(id);
      window.setTimeout(() => setSettledId(null), 150);
      moveTask(id, target.columnId, target.beforeId);
      if (target.hidden) {
        const column = columns.find((item) => item.id === target.columnId);
        toast(`Moved to ${column?.name ?? "hidden column"}`);
      }
    }
    finish();
  };

  const panel = <HiddenColumns columns={hiddenColumns} counts={hiddenCounts} />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={finish}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Press Enter to open the issue. Drag it with a pointer to move it to another column.",
        },
      }}
    >
      <div className="relative flex min-h-0 flex-1">
        <motion.div
          layoutScroll
          className="scroll-thin flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden lg:snap-none"
        >
          {visibleColumns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] ?? []}
              members={members}
              teamName={teamName}
              display={display}
              activeId={activeId}
              activeTask={activeTask}
              placement={placement}
              settledId={settledId}
            />
          ))}
          {visibleColumns.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <h2>Every column is hidden</h2>
              <p className="text-muted-foreground max-w-[22em]">
                Bring a column back from the hidden columns panel to see your
                issues.
              </p>
            </div>
          )}
        </motion.div>
        {nothingVisible && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 px-8 text-center">
            <div className="shadow-card pointer-events-auto flex flex-col items-center gap-3 rounded-2xl bg-white p-6">
              <h2>No issues match</h2>
              <p className="text-muted-foreground max-w-[22em]">
                Try a different search or clear the active filters.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  clearFilter();
                  setSearch("");
                }}
              >
                Clear search and filters
              </Button>
            </div>
          </div>
        )}
        {panelOpen && (
          <div className="border-border hidden shrink-0 border-l lg:flex">
            {panel}
          </div>
        )}
      </div>
      <AnimatePresence>
        {panelSheetOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setPanelSheetOpen(false)}
              className="bg-foreground/40 absolute inset-0"
            />
            <motion.div
              initial={{ x: 240 }}
              animate={{ x: 0 }}
              exit={{ x: 240 }}
              transition={{ duration: 0.24, ease: ease.power3Out }}
              className="shadow-popover absolute inset-y-0 right-0 flex w-[240px] flex-col bg-white"
            >
              <HiddenColumns
                columns={hiddenColumns}
                counts={hiddenCounts}
                onClose={() => setPanelSheetOpen(false)}
                className="w-full flex-1"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {mounted &&
        createPortal(
          <DragOverlay dropAnimation={null} zIndex={80}>
            {activeTask && activeColumn && (
              <TaskCardView
                key={`${activeTask.id}-${dragCount}`}
                task={activeTask}
                column={activeColumn}
                members={members}
                teamName={teamName}
                display={display}
                lifted
                className="cursor-grabbing"
              />
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
