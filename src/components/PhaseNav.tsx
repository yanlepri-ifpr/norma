import { CheckCircle2, Circle, Scale } from "lucide-react";
import { PHASES, TASKS } from "@/lib/checklist-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  completed: number[];
  activeIndex: number;
  onSelectPhase: (index: number) => void;
};

export function PhaseNav({ completed, activeIndex, onSelectPhase }: Props) {
  const isReachable = (index: number) =>
    PHASES.slice(0, index).every((p) => {
      const ts = TASKS.filter((t) => t.phaseId === p.id);
      return ts.every((t) => completed.includes(t.id));
    });

  return (
    <nav aria-label="Fases do processo" className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Scale aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">Norma</p>
          <p className="text-xs text-sidebar-foreground/70">Painel do Demandante</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {PHASES.map((phase, index) => {
          const tasks = TASKS.filter((t) => t.phaseId === phase.id);
          const done = tasks.filter((t) => completed.includes(t.id)).length;
          const pct = Math.round((done / tasks.length) * 100);
          const isActive = index === activeIndex;
          const reachable = isReachable(index);
          return (
            <li key={phase.id}>
              <button
                type="button"
                onClick={() => onSelectPhase(index)}
                disabled={!reachable}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={!reachable}
                className={cn(
                  "w-full rounded-md border border-transparent px-3 py-3 text-left transition-colors",
                  "hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive && "border-sidebar-border bg-sidebar-accent",
                  !reachable && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="flex items-center gap-2">
                  {done === tasks.length ? (
                    <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-400" />
                  ) : (
                    <Circle aria-hidden="true" className="size-4 text-sidebar-foreground/60" />
                  )}
                  <span className="text-sm font-medium">{phase.name}</span>
                  <span className="ml-auto text-xs text-sidebar-foreground/70">
                    {done}/{tasks.length}
                  </span>
                </span>
                <span className="mt-1 block pl-6 text-xs text-sidebar-foreground/70">
                  {phase.subtitle}
                </span>
                <Progress
                  value={pct}
                  aria-label={`Progresso da ${phase.name}: ${pct}%`}
                  className="mt-2 h-1.5 bg-sidebar-border"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto text-xs leading-relaxed text-sidebar-foreground/60">
        Fluxo baseado na Lei 14.133/2021. Os anexos são simulados e nenhum dado pessoal é
        armazenado.
      </p>
    </nav>
  );
}
