"use client";

import Dialog from "@/components/_ui/dialog";
import { useUiStore } from "@/stores/ui-store";

const shortcuts = [
  { keys: ["/"], label: "Focar a busca" },
  { keys: ["N"], label: "Nova tarefa" },
  { keys: ["["], label: "Recolher ou expandir a barra lateral" },
  { keys: ["?"], label: "Abrir esta ajuda" },
  { keys: ["Esc"], label: "Fechar menus e diálogos" },
];

const tips = [
  "Arraste um cartão para reordenar ou mover para outra coluna.",
  "Solte um cartão numa coluna oculta para tirá-lo do quadro.",
  "Clique na prioridade, no responsável ou na data para alterar ali mesmo.",
];

export default function HelpDialog({ open }: { open: boolean }) {
  const closeDialog = useUiStore((state) => state.closeDialog);

  return (
    <Dialog open={open} onClose={closeDialog} title="Ajuda e recursos">
      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-3">
          <h3>Atalhos</h3>
          <div className="divide-border flex flex-col divide-y">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.label}
                className="flex items-center justify-between py-2"
              >
                <span>{shortcut.label}</span>
                <span className="flex gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="bg-secondary text-muted-foreground shadow-ring inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-mono text-[12px]"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h3>Usando o quadro</h3>
          <ul className="flex flex-col gap-2">
            {tips.map((tip) => (
              <li key={tip} className="text-muted-foreground flex gap-2">
                <span
                  aria-hidden
                  className="bg-icon mt-[7px] size-1.5 shrink-0 rounded-full"
                />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Dialog>
  );
}
