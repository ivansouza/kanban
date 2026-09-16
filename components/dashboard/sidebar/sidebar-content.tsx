"use client";

import SidebarItem from "@/components/dashboard/sidebar/sidebar-item";
import SidebarTeam from "@/components/dashboard/sidebar/sidebar-team";
import Button from "@/components/_ui/button";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import Logo from "@/public/assets/images/_common/logo.svg";
import AlignLeftIcon from "@/public/assets/images/_common/icons/align-left-01.svg";
import InboxIcon from "@/public/assets/images/_common/icons/inbox-01.svg";
import GridIcon from "@/public/assets/images/_common/icons/grid-03.svg";
import CubeIcon from "@/public/assets/images/_common/icons/cube-01.svg";
import LayersIcon from "@/public/assets/images/_common/icons/layers-three-01.svg";
import DotsIcon from "@/public/assets/images/_common/icons/dots-horizontal.svg";
import ShareIcon from "@/public/assets/images/_common/icons/share-01.svg";
import UserPlusIcon from "@/public/assets/images/_common/icons/user-plus-01.svg";
import LinkIcon from "@/public/assets/images/_common/icons/link-03.svg";
import ArrowLeftIcon from "@/public/assets/images/_common/icons/arrow-narrow-left.svg";
import HelpIcon from "@/public/assets/images/_common/icons/help-circle.svg";

type SidebarContentProps = {
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel: string;
};

function SidebarLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: string;
}) {
  return (
    <span
      className={cn(
        "label-style text-muted-foreground px-2 py-1",
        collapsed && "sr-only",
      )}
    >
      {children}
    </span>
  );
}

export default function SidebarContent({
  collapsed,
  onToggle,
  toggleLabel,
}: SidebarContentProps) {
  const nav = useUiStore((state) => state.nav);
  const setNav = useUiStore((state) => state.setNav);
  const openDialog = useUiStore((state) => state.openDialog);
  const toast = useUiStore((state) => state.toast);
  const githubConnected = useKanbanStore((state) => state.githubConnected);
  const toggleGithub = useKanbanStore((state) => state.toggleGithub);
  const pad = collapsed ? "p-3" : "p-4";

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "border-border flex items-center gap-2 border-b",
          pad,
          collapsed && "flex-col",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Logo
            role="img"
            aria-label="Kanbaaan"
            className="size-[30px] shrink-0"
          />
          <span className={cn("lead-style truncate", collapsed && "sr-only")}>
            Kanbaaan
          </span>
        </div>
        <Button
          variant="secondary"
          size="icon"
          aria-label={toggleLabel}
          onClick={onToggle}
          className="shadow-ring"
        >
          <AlignLeftIcon
            aria-hidden
            className={cn(
              "text-icon ease-power3-in-out size-3.5 transition-transform duration-200",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <nav
        aria-label="Personal"
        className={cn("border-border flex flex-col gap-1 border-b", pad)}
      >
        <SidebarItem
          icon={InboxIcon}
          label="Inbox"
          collapsed={collapsed}
          active={nav === "inbox"}
          onClick={() => setNav("inbox")}
        />
        <SidebarItem
          icon={GridIcon}
          label="My issues"
          collapsed={collapsed}
          active={nav === "my-issues"}
          onClick={() => setNav("my-issues")}
        />
      </nav>

      <nav
        aria-label="Workspace"
        className={cn(
          "border-border flex flex-col gap-6 border-b",
          pad,
          collapsed && "gap-3",
        )}
      >
        <div className="flex flex-col gap-1">
          <SidebarLabel collapsed={collapsed}>Workspace</SidebarLabel>
          <SidebarItem
            icon={CubeIcon}
            label="Projects"
            collapsed={collapsed}
            active={nav === "projects"}
            onClick={() => setNav("projects")}
          />
          <SidebarItem
            icon={LayersIcon}
            label="Views"
            collapsed={collapsed}
            active={nav === "views"}
            onClick={() => setNav("views")}
          />
          <SidebarItem
            icon={DotsIcon}
            label="More"
            collapsed={collapsed}
            active={nav === "more"}
            onClick={() => setNav("more")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <SidebarLabel collapsed={collapsed}>Your teams</SidebarLabel>
          <SidebarTeam collapsed={collapsed} />
        </div>
      </nav>

      <div
        className={cn(
          "scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto",
          pad,
        )}
      >
        <SidebarItem
          icon={ShareIcon}
          label="Import issue"
          collapsed={collapsed}
          onClick={() => openDialog({ type: "import" })}
        />
        <SidebarItem
          icon={UserPlusIcon}
          label="Invite people"
          collapsed={collapsed}
          onClick={() => openDialog({ type: "invite" })}
        />
        <SidebarItem
          icon={LinkIcon}
          label={githubConnected ? "GitHub connected" : "Connect Github"}
          collapsed={collapsed}
          onClick={() => {
            toggleGithub();
            toast(githubConnected ? "GitHub disconnected" : "GitHub connected");
          }}
          trailing={
            githubConnected ? (
              <span
                aria-hidden
                className="bg-success size-1.5 shrink-0 rounded-full"
              />
            ) : undefined
          }
        />
      </div>

      <div className={cn("flex flex-col", pad)}>
        <SidebarItem
          icon={ArrowLeftIcon}
          label="Back to agents"
          collapsed={collapsed}
          className="gap-2"
          onClick={() => toast("Agents aren't part of this demo yet")}
        />
        <SidebarItem
          icon={HelpIcon}
          label="Help and resource"
          collapsed={collapsed}
          className="gap-2"
          onClick={() => openDialog({ type: "help" })}
        />
      </div>
    </div>
  );
}
