"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import Button from "@/components/_ui/button";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export default function SidebarItem({
  icon: Icon,
  label,
  active = false,
  collapsed = false,
  onClick,
  leading,
  trailing,
  className,
}: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      size="md"
      data-active={active}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={cn(
        "group/item w-full justify-start gap-1.5 px-2",
        collapsed && "justify-center px-0",
        className,
      )}
    >
      {leading ??
        (Icon && (
          <Icon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 transition-colors duration-150",
              active
                ? "text-foreground"
                : "text-icon group-hover/item:text-muted-foreground",
            )}
          />
        ))}
      <span
        className={cn(
          "min-w-0 flex-1 truncate px-0.5 text-left",
          collapsed && "sr-only",
        )}
      >
        {label}
      </span>
      {!collapsed && trailing}
    </Button>
  );
}
