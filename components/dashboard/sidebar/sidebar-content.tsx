"use client";

import SidebarItem, {
  sidebarFade,
} from "@/components/dashboard/sidebar/sidebar-item";
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
      data-collapsed={collapsed}
      className={cn(
        "label-style text-muted-foreground px-2 py-1 whitespace-nowrap",
        sidebarFade,
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

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "border-border ease-smooth-in-out relative shrink-0 border-b transition-[height] duration-200",
          collapsed ? "h-[100px]" : "h-[62px]",
        )}
      >
        <Logo
          role="img"
          aria-label="Kanbaaan"
          className="absolute top-4 left-4 size-[30px]"
        />
        <span
          data-collapsed={collapsed}
          className={cn(
            "lead-style absolute top-4 left-[54px] flex h-[30px] items-center whitespace-nowrap",
            sidebarFade,
          )}
        >
          Kanbaaan
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label={toggleLabel}
          onClick={onToggle}
          className={cn(
            "shadow-ring ease-smooth-in-out absolute transition-[top,left] duration-200",
            collapsed ? "top-[54px] left-[15px]" : "top-4 left-[214px]",
          )}
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
        aria-label="Pessoal"
        className="border-border flex flex-col gap-1 border-b p-4"
      >
        <SidebarItem
          icon={InboxIcon}
          label="Caixa de entrada"
          collapsed={collapsed}
          active={nav === "inbox"}
          onClick={() => setNav("inbox")}
        />
        <SidebarItem
          icon={GridIcon}
          label="Minhas tarefas"
          collapsed={collapsed}
          active={nav === "my-issues"}
          onClick={() => setNav("my-issues")}
        />
      </nav>

      <nav
        aria-label="Espaço"
        className="border-border flex flex-col gap-6 border-b p-4"
      >
        <div className="flex flex-col gap-1">
          <SidebarLabel collapsed={collapsed}>Espaço</SidebarLabel>
          <SidebarItem
            icon={CubeIcon}
            label="Projetos"
            collapsed={collapsed}
            active={nav === "projects"}
            onClick={() => setNav("projects")}
          />
          <SidebarItem
            icon={LayersIcon}
            label="Visões"
            collapsed={collapsed}
            active={nav === "views"}
            onClick={() => setNav("views")}
          />
          <SidebarItem
            icon={DotsIcon}
            label="Mais"
            collapsed={collapsed}
            active={nav === "more"}
            onClick={() => setNav("more")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <SidebarLabel collapsed={collapsed}>Suas equipes</SidebarLabel>
          <SidebarTeam collapsed={collapsed} />
        </div>
      </nav>

      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4">
        <SidebarItem
          icon={ShareIcon}
          label="Importar tarefa"
          collapsed={collapsed}
          onClick={() => openDialog({ type: "import" })}
        />
        <SidebarItem
          icon={UserPlusIcon}
          label="Convidar pessoas"
          collapsed={collapsed}
          onClick={() => openDialog({ type: "invite" })}
        />
        <SidebarItem
          icon={LinkIcon}
          label={githubConnected ? "GitHub conectado" : "Conectar GitHub"}
          collapsed={collapsed}
          onClick={() => {
            toggleGithub();
            toast(githubConnected ? "GitHub desconectado" : "GitHub conectado");
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

      <div className="flex flex-col p-4">
        <SidebarItem
          icon={ArrowLeftIcon}
          label="Voltar aos agentes"
          collapsed={collapsed}
          className="gap-2"
          onClick={() => toast("Agentes ainda não fazem parte desta demo")}
        />
        <SidebarItem
          icon={HelpIcon}
          label="Ajuda e recursos"
          collapsed={collapsed}
          className="gap-2"
          onClick={() => openDialog({ type: "help" })}
        />
      </div>
    </div>
  );
}
