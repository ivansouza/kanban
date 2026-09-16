import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function OriginSlot({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "ease-smooth-in-out grid transition-[grid-template-rows,margin-top] duration-200",
        open ? "grid-rows-[1fr]" : "-mt-3.5 grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="border-border bg-secondary rounded-2xl border border-dashed">
          {children}
        </div>
      </div>
    </div>
  );
}
