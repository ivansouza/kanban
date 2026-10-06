"use client";

import { useRef, useState } from "react";
import Button from "@/components/_ui/button";
import Menu, { type MenuItem } from "@/components/_ui/menu";
import Sheet from "@/components/_ui/sheet";
import ToolbarFilterSheet from "@/components/dashboard/toolbar/toolbar-filter-sheet";
import { useKanbanStore } from "@/stores/kanban-store";
import { isFilterActive, useUiStore } from "@/stores/ui-store";
import { useMobileBreakpoints } from "@/hooks/use-mobile-breakpoints";
import { PRIORITIES } from "@/lib/kanban";
import { PRIORITY_COLOR } from "@/components/_common/column-meta";
import FilterIcon from "@/public/assets/images/_common/icons/filter-lines.svg";
import BarChartIcon from "@/public/assets/images/_common/icons/bar-chart-12.svg";
import UserIcon from "@/public/assets/images/_common/icons/user-03.svg";
import CalendarIcon from "@/public/assets/images/_common/icons/calendar.svg";

export default function ToolbarFilter() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const filter = useUiStore((state) => state.filter);
  const setFilter = useUiStore((state) => state.setFilter);
  const clearFilter = useUiStore((state) => state.clearFilter);
  const members = useKanbanStore((state) => state.members);
  const { belowSm } = useMobileBreakpoints();
  const active = isFilterActive(filter);

  const items: MenuItem[] = [
    { id: "h-priority", heading: "Prioridade" },
    ...PRIORITIES.map<MenuItem>((priority) => ({
      id: `p-${priority.value}`,
      label: priority.label,
      icon: <BarChartIcon className={PRIORITY_COLOR[priority.value]} />,
      checked: filter.priority === priority.value,
      keepOpen: true,
      onSelect: () =>
        setFilter({
          priority: filter.priority === priority.value ? null : priority.value,
        }),
    })),
    { id: "h-assignee", heading: "Responsável" },
    ...members.map<MenuItem>((member) => ({
      id: `m-${member.id}`,
      label: member.name,
      icon: <UserIcon />,
      checked: filter.assigneeId === member.id,
      keepOpen: true,
      onSelect: () =>
        setFilter({
          assigneeId: filter.assigneeId === member.id ? null : member.id,
        }),
    })),
    { id: "h-due", heading: "Prazo" },
    {
      id: "overdue",
      label: "Só atrasadas",
      icon: <CalendarIcon />,
      checked: filter.overdue,
      keepOpen: true,
      onSelect: () => setFilter({ overdue: !filter.overdue }),
    },
    { id: "sep", separator: true },
    {
      id: "clear",
      label: "Limpar filtros",
      disabled: !active,
      onSelect: clearFilter,
    },
  ];

  return (
    <>
      <Button
        ref={anchorRef}
        variant="secondary"
        size="icon"
        aria-label="Filtrar tarefas"
        aria-expanded={open}
        data-active={open || active}
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <FilterIcon className="size-3.5" aria-hidden />
        {active && (
          <span
            aria-hidden
            className="bg-info absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-white"
          />
        )}
      </Button>
      {belowSm ? (
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          title="Filtro e exibição"
          footer={
            <>
              <Button
                variant="ghost"
                size="lg"
                disabled={!active}
                onClick={clearFilter}
                className="mr-auto"
              >
                Limpar filtros
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </>
          }
        >
          <ToolbarFilterSheet />
        </Sheet>
      ) : (
        <Menu
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
          align="end"
          label="Filtrar tarefas"
          items={items}
          className="w-[220px]"
        />
      )}
    </>
  );
}
