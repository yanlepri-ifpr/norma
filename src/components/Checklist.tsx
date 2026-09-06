import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Circle,
  FileDown,
  FileText,
  HelpCircle,
  Lock,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DEFAULT_REPLY,
  FINAL_TASK_ID,
  PHASES,
  TASKS,
  TASK_REPLIES,
  TASK_TEMPLATES,
  type Phase,
  type Task,
} from "@/lib/checklist-data";
import { cn } from "@/lib/utils";

export type FinalStatus = "pending" | "approved" | "returned";

type Props = {
  completed: number[];
  attachments: Record<number, string>;
  finalStatus: FinalStatus;
  phase: Phase;
  phaseIndex: number;
  onNextPhase: () => void;
  onAttach: (taskId: number, fileName: string) => void;
  onRemoveAttachment: (taskId: number) => void;
  onAsk: (question: string, reply?: string) => void;
  onApprove: () => void;
  onReturn: () => void;
};

export function Checklist({
  completed,
  attachments,
  finalStatus,
  phase,
  phaseIndex,
  onNextPhase,
  onAttach,
  onRemoveAttachment,
  onAsk,
  onApprove,
  onReturn,
}: Props) {
  const total = TASKS.length;
  const done = completed.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const isDone = (id: number) => completed.includes(id);
  const isUnlocked = (id: number) => id === 1 || isDone(id - 1);

  const tasks = TASKS.filter((t) => t.phaseId === phase.id);
  const finalTaskId =
    TASKS.filter((t) => t.phaseId === PHASES[PHASES.length - 1]!.id).slice(-1)[0]?.id ??
    FINAL_TASK_ID;
  const isFinal = isDone(finalTaskId);
  const phaseDone = tasks.filter((t) => isDone(t.id)).length;
  const phasePct = Math.round((phaseDone / tasks.length) * 100);
  const phaseComplete = phaseDone === tasks.length;
  const isLastPhase = phaseIndex === PHASES.length - 1;
  const isLast = phaseIndex === PHASES.length - 1;

  const fileRef = useRef<HTMLInputElement>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  const pickFile = (taskId: number) => {
    setTargetId(taskId);
    fileRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetId !== null) onAttach(targetId, file.name);
    e.target.value = "";
  };

  const handleApprove = () => {
    const blob = new Blob([], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "processo de compra.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onApprove();
  };

  const downloadTemplate = (task: Task) => {
    const fileName = TASK_TEMPLATES[task.id] ?? `modelo-etapa-${task.id}.docx`;
    const content = [
      "MODELO DE DOCUMENTO (PROTÓTIPO)",
      "",
      `Etapa ${task.id} — ${task.title}`,
      "",
      "Este é um modelo fictício gerado para demonstração do protótipo.",
      "Substitua este conteúdo pelo documento oficial correspondente à etapa.",
    ].join("\n");
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Download do modelo iniciado", { description: fileName });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFile}
        aria-hidden="true"
        tabIndex={-1}
      />
      <header className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Check-list do Processo de Compras Públicas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe as {total} etapas obrigatórias para elaboração do edital.
            </p>
          </div>
          <p className="text-right">
            <span className="block text-3xl font-bold text-primary">{pct}%</span>
            <span className="text-xs text-muted-foreground">
              {done} de {total} tarefas
            </span>
          </p>
        </div>
        <Progress
          value={pct}
          className="mt-4 h-3"
          aria-label={`Progresso geral do processo: ${pct}%`}
        />
      </header>

      {finalStatus === "approved" && (
        <Alert className="border-emerald-600/40 bg-emerald-50 text-emerald-900">
          <CheckCircle aria-hidden="true" className="size-4 text-emerald-700" />
          <AlertTitle>Processo concluído pelo Setor de Compras</AlertTitle>
          <AlertDescription className="text-emerald-800">
            O edital está pronto.
          </AlertDescription>
        </Alert>
      )}
      {finalStatus === "returned" && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" className="size-4" />
          <AlertTitle>Processo retornado para correção</AlertTitle>
          <AlertDescription>
            A etapa {finalTaskId} foi reaberta. Ajuste os apontamentos do Setor de Compras e reenvie
            o processo.
          </AlertDescription>
        </Alert>
      )}

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
            <FileText aria-hidden="true" className="size-4 text-primary" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">
              {phase.name} — {phase.subtitle}
            </h2>
            <p className="text-xs text-muted-foreground">
              {phaseDone} de {tasks.length} concluídas
            </p>
          </div>
          <span className="ml-auto text-2xl font-bold text-primary">{phasePct}%</span>
        </header>
        <Progress
          value={phasePct}
          className="h-1.5"
          aria-label={`Progresso da ${phase.name}: ${phasePct}%`}
        />
        <ul className="space-y-2 p-4">
          {tasks.map((task) => {
            const done_ = isDone(task.id);
            const unlocked = isUnlocked(task.id);
            return (
              <li
                key={task.id}
                className={cn(
                  "rounded-md border p-3 transition-colors",
                  done_ ? "border-emerald-200 bg-emerald-50/60" : "bg-background",
                  !unlocked && "opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium text-foreground",
                        done_ && "line-through decoration-emerald-700/50",
                      )}
                    >
                      <span className="text-muted-foreground">{task.id}.</span> {task.title}
                    </p>
                    {attachments[task.id] && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Upload aria-hidden="true" className="size-3" />
                        {attachments[task.id]}
                      </p>
                    )}
                    {!unlocked && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Conclua a tarefa anterior para liberar esta etapa.
                      </p>
                    )}

                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!unlocked || done_}
                        onClick={() =>
                          onAsk(
                            `Sobre a etapa ${task.id} — ${task.title}: o que preencho aqui?`,
                            TASK_REPLIES[task.id] ?? DEFAULT_REPLY,
                          )
                        }
                        className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/10"
                      >
                        <HelpCircle aria-hidden="true" className="size-3.5" />O que preencho aqui?
                      </Button>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(task)}
                      aria-label={`Baixar modelo da tarefa ${task.id}`}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <FileDown aria-hidden="true" className="size-4" />
                      <span className="sr-only sm:not-sr-only">Modelo</span>
                    </Button>

                    {attachments[task.id] ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveAttachment(task.id)}
                        aria-label={`Remover arquivo da tarefa ${task.id}`}
                        className="shrink-0 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        <span className="sr-only sm:not-sr-only">Remover</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!unlocked}
                        onClick={() => pickFile(task.id)}
                        aria-label={`Anexar arquivo à tarefa ${task.id}`}
                        className="shrink-0"
                      >
                        <Paperclip aria-hidden="true" className="size-4" />
                        <span className="sr-only sm:not-sr-only">Anexar</span>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {(isLastPhase && isFinal) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle aria-hidden="true" className="size-4 text-emerald-600" />
            Edital pronto. Conclua o processo ou retorne com apontamentos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={finalStatus === "approved"}
              onClick={handleApprove}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle aria-hidden="true" className="size-4" />
              Gerar Processo
            </Button>
            <Button type="button" variant="destructive" onClick={onReturn} disabled={!isFinal}>
              <AlertCircle aria-hidden="true" className="size-4" />
              Retornar com Erro
            </Button>
          </div>
        </div>
      )}

      {!isLast && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm">
          {phaseComplete ? (
            <>
              <p className="text-sm font-medium text-emerald-700">
                Fase concluída! Você pode avançar para a próxima.
              </p>
              <Button type="button" onClick={onNextPhase}>
                Próxima fase: {PHASES[phaseIndex + 1]!.name}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock aria-hidden="true" className="size-4" />
              Conclua todas as tarefas desta fase para avançar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
