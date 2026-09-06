import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checklist, type FinalStatus } from "@/components/Checklist";
import { PhaseNav } from "@/components/PhaseNav";
import { FINAL_TASK_ID, PHASES, TASKS, TASK_TEMPLATES } from "@/lib/checklist-data";

export const Route = createFileRoute("/fim")({
  head: () => ({
    meta: [
      { title: "Conclusão do Processo | Check-list de Compras Públicas" },
      {
        name: "description",
        content:
          "Tela de validação do checklist de compras públicas com todos os itens entregues para testar a conclusão do processo.",
      },
    ],
  }),
  component: FimScreen,
});

const ALL_TASK_IDS = TASKS.map((t) => t.id);
const INITIAL_ATTACHMENTS: Record<number, string> = Object.fromEntries(
  TASKS.map((t) => [t.id, TASK_TEMPLATES[t.id] ?? `modelo-etapa-${t.id}.docx`]),
);

function FimScreen() {
  const [completed, setCompleted] = useState<number[]>(ALL_TASK_IDS);
  const [attachments, setAttachments] = useState<Record<number, string>>(INITIAL_ATTACHMENTS);
  const [finalStatus, setFinalStatus] = useState<FinalStatus>("pending");
  const [activeIndex, setActiveIndex] = useState(PHASES.length - 1);

  const attach = (taskId: number, fileName: string) => {
    setAttachments((prev) => ({ ...prev, [taskId]: fileName }));
    setCompleted((prev) => {
      if (prev.includes(taskId)) return prev;
      const unlocked = taskId === 1 || prev.includes(taskId - 1);
      if (!unlocked) return prev;
      return [...prev, taskId].sort((a, b) => a - b);
    });
    toast.success("Arquivo anexado", { description: fileName });
  };

  const removeAttachment = (taskId: number) => {
    setAttachments((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setCompleted((prev) => prev.filter((id) => id !== taskId));
    setFinalStatus("pending");
    toast("Arquivo removido");
  };

  const approve = () => {
    setCompleted((prev) => (prev.includes(FINAL_TASK_ID) ? prev : [...prev, FINAL_TASK_ID]));
    setFinalStatus("approved");
    toast.success("Edital aprovado concluido", {
      description: "Processo concluído em 100%.",
    });
  };

  const returnWithError = () => {
    setCompleted((prev) => prev.filter((id) => id < 15));
    setFinalStatus("returned");
    toast.error("Edital retornado com apontamentos", {
      description: "Última etapa reaberta.",
    });
  };

  const selectPhase = (index: number) => {
    const reachable = PHASES.slice(0, index).every((p) => {
      const ts = TASKS.filter((t) => t.phaseId === p.id);
      return ts.every((t) => completed.includes(t.id));
    });
    if (!reachable) return;
    setActiveIndex(index);
  };

  const nextPhase = () => {
    setActiveIndex((i) => Math.min(i + 1, PHASES.length - 1));
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setCompleted(ALL_TASK_IDS);
    setAttachments(INITIAL_ATTACHMENTS);
    setFinalStatus("pending");
    setActiveIndex(PHASES.length - 1);
    toast("Simulação reiniciada", {
      description: "Todos os itens voltaram a ser listados como entregues.",
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <PhaseNav completed={completed} activeIndex={activeIndex} onSelectPhase={selectPhase} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Norma</p>
            <p className="text-xs text-primary-foreground/75">
              {completed.length} de {TASKS.length} tarefas concluídas
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reiniciar simulação
          </Button>
        </div>

        <Checklist
          completed={completed}
          attachments={attachments}
          finalStatus={finalStatus}
          phase={PHASES[activeIndex]!}
          phaseIndex={activeIndex}
          onNextPhase={nextPhase}
          onAttach={attach}
          onRemoveAttachment={removeAttachment}
          onAsk={() => undefined}
          onApprove={approve}
          onReturn={returnWithError}
        />
      </main>
    </div>
  );
}
