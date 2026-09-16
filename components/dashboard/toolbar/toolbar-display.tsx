"use client";

import { useRef, useState } from "react";
import Button from "@/components/_ui/button";
import Menu, { type MenuItem } from "@/components/_ui/menu";
import { useUiStore, type Display } from "@/stores/ui-store";
import SettingsIcon from "@/public/assets/images/_common/icons/settings-04.svg";

const options: { key: keyof Display; label: string }[] = [
  { key: "created", label: "Created date" },
  { key: "priority", label: "Priority" },
  { key: "assignees", label: "Assignees" },
  { key: "due", label: "Due date" },
];

export default function ToolbarDisplay() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const display = useUiStore((state) => state.display);
  const setDisplay = useUiStore((state) => state.setDisplay);

  const items: MenuItem[] = [
    { id: "heading", heading: "Show on cards" },
    ...options.map<MenuItem>((option) => ({
      id: option.key,
      label: option.label,
      checked: display[option.key],
      keepOpen: true,
      onSelect: () => setDisplay({ [option.key]: !display[option.key] }),
    })),
  ];

  return (
    <>
      <Button
        ref={anchorRef}
        variant="secondary"
        size="icon"
        aria-label="Display options"
        aria-expanded={open}
        data-active={open}
        onClick={() => setOpen((value) => !value)}
      >
        <SettingsIcon className="size-3.5" aria-hidden />
      </Button>
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        align="end"
        label="Display options"
        items={items}
      />
    </>
  );
}
