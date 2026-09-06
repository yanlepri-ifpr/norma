import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { FileUp, FileText, Layers, ListChecks, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  ANALISTA_PHASES_KEY,
  ANALISTA_TASKS_KEY,
  ANALISTA_TEMPLATES_KEY,
  SEED_PHASES,
  SEED_TASKS,
  formatBytes,
  type Phase,
  type Task,
  type UploadedTemplate,
} from "@/lib/analista-data";

export const Route = createFileRoute("/analista/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist | Painel do Analista" },
      {
        name: "description",
        content:
          "Crie e organize as fases e etapas do checklist de compras públicas e associe modelos .docx por etapa.",
      },
    ],
  }),
  component: ChecklistEditor,
});

function ChecklistEditor() {
  const [phases, setPhases] = useLocalStorage<Phase[]>(ANALISTA_PHASES_KEY, SEED_PHASES);
  const [tasks, setTasks] = useLocalStorage<Task[]>(ANALISTA_TASKS_KEY, SEED_TASKS);
  const [templates, setTemplates] = useLocalStorage<Record<number, UploadedTemplate>>(
    ANALISTA_TEMPLATES_KEY,
    {},
  );

  const [phaseName, setPhaseName] = useState("");
  const [phaseSubtitle, setPhaseSubtitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPhaseId, setTaskPhaseId] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [templateTarget, setTemplateTarget] = useState<number | null>(null);

  const phasesList = phases ?? [];
  const tasksList = tasks ?? [];
  const templatesMap = templates ?? {};

  const nextId = (list: { id: number }[]) =>
    list.length === 0 ? 1 : Math.max(...list.map((item) => item.id)) + 1;

  const addPhase = (e: FormEvent) => {
    e.preventDefault();
    const name = phaseName.trim();
    if (!name) return;
    setPhases((prev) => [
      ...(prev ?? []),
      { id: nextId(prev ?? []), name, subtitle: phaseSubtitle.trim() },
    ]);
    setPhaseName("");
    setPhaseSubtitle("");
    toast.success("Fase criada", { description: name });
  };

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    const title = taskTitle.trim();
    const phaseId = Number(taskPhaseId);
    if (!title || !phaseId) return;
    setTasks((prev) => [...(prev ?? []), { id: nextId(prev ?? []), title, phaseId }]);
    setTaskTitle("");
    setTaskPhaseId("");
    toast.success("Etapa criada", { description: title });
  };

  const removePhase = (id: number) => {
    setPhases((prev) => (prev ?? []).filter((p) => p.id !== id));
    setTasks((prev) => {
      const removed = (prev ?? []).filter((t) => t.phaseId === id);
      if (removed.length > 0) {
        setTemplates((prevT) => {
          const next = { ...(prevT ?? {}) };
          removed.forEach((t) => delete next[t.id]);
          return next;
        });
      }
      return prev ?? [];
    });
    if (String(id) === taskPhaseId) setTaskPhaseId("");
    toast("Fase removida", {
      description: "As etapas desta fase também foram removidas.",
    });
  };

  const removeTask = (id: number) => {
    setTasks((prev) => (prev ?? []).filter((t) => t.id !== id));
    setTemplates((prev) => {
      const next = { ...(prev ?? {}) };
      delete next[id];
      return next;
    });
    toast("Etapa removida");
  };

  const pickTemplate = (taskId: number) => {
    setTemplateTarget(taskId);
    fileRef.current?.click();
  };

  const handleTemplateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && templateTarget !== null) {
      const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx");
      if (!isDocx) {
        toast.error("Apenas arquivos .docx são aceitos", {
          description: "Selecione um modelo em formato .docx",
        });
        e.target.value = "";
        return;
      }
      setTemplates((prev) => ({
        ...(prev ?? {}),
        [templateTarget]: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`,
          name: file.name,
          size: file.size,
          addedAt: new Date().toISOString(),
        },
      }));
      toast.success("Modelo .docx enviado", {
        description: `${file.name} vinculado à etapa ${templateTarget}.`,
      });
    }
    e.target.value = "";
  };

  const removeTemplate = (taskId: number) => {
    setTemplates((prev) => {
      const next = { ...(prev ?? {}) };
      delete next[taskId];
      return next;
    });
    toast("Modelo removido da etapa");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Estrutura do Checklist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Crie as fases do processo, as etapas de cada fase e associe um modelo .docx por etapa.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleTemplateFile}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova fase</CardTitle>
            <CardDescription>Adicione uma fase do processo de compras públicas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addPhase} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phase-name">Nome da fase</Label>
                <Input
                  id="phase-name"
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  placeholder="Ex.: Fase 1 — Origem e Triagem"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phase-subtitle">Subtítulo (opcional)</Label>
                <Input
                  id="phase-subtitle"
                  value={phaseSubtitle}
                  onChange={(e) => setPhaseSubtitle(e.target.value)}
                  placeholder="Ex.: Triagem das demandas"
                />
              </div>
              <Button type="submit" disabled={!phaseName.trim()}>
                <Plus aria-hidden="true" className="size-4" />
                Adicionar fase
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova etapa</CardTitle>
            <CardDescription>Adicione uma etapa vinculada a uma fase existente.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-title">Título da etapa</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ex.: Construir Documento de Formalização de Demanda"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-phase">Fase</Label>
                <Select
                  value={taskPhaseId}
                  onValueChange={setTaskPhaseId}
                  disabled={phasesList.length === 0}
                >
                  <SelectTrigger id="task-phase" className="w-full">
                    <SelectValue
                      placeholder={
                        phasesList.length === 0 ? "Crie uma fase primeiro" : "Selecione a fase"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {phasesList.map((phase) => (
                      <SelectItem key={phase.id} value={String(phase.id)}>
                        {phase.name}
                        {phase.subtitle ? ` — ${phase.subtitle}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={!taskTitle.trim() || !taskPhaseId || phasesList.length === 0}
              >
                <Plus aria-hidden="true" className="size-4" />
                Adicionar etapa
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estrutura atual</CardTitle>
          <CardDescription>
            {phasesList.length === 0 && tasksList.length === 0
              ? "O checklist ainda não possui fases nem etapas."
              : `${phasesList.length} fase(s) e ${tasksList.length} etapa(s) no total.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {phasesList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Layers aria-hidden="true" className="size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                As fases que você criar aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {phasesList.map((phase) => {
                const phaseTasks = tasksList.filter((t) => t.phaseId === phase.id);
                return (
                  <div key={phase.id} className="rounded-lg border">
                    <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Layers aria-hidden="true" className="size-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{phase.name}</p>
                          {phase.subtitle && (
                            <p className="truncate text-xs text-muted-foreground">
                              {phase.subtitle}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {phaseTasks.length} etapa(s)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhase(phase.id)}
                        aria-label={`Remover fase ${phase.name}`}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                    {phaseTasks.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        Nenhuma etapa nesta fase ainda.
                      </p>
                    ) : (
                      <ul className="flex flex-col divide-y">
                        {phaseTasks.map((task) => {
                          const template = templatesMap[task.id];
                          return (
                            <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                              <ListChecks
                                aria-hidden="true"
                                className="size-4 shrink-0 text-muted-foreground"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="block truncate text-sm">{task.title}</span>
                                {template ? (
                                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                    <FileText aria-hidden="true" className="size-3.5 shrink-0" />
                                    <span className="truncate" title={template.name}>
                                      {template.name}
                                    </span>
                                    <span>({formatBytes(template.size)})</span>
                                  </span>
                                ) : (
                                  <span className="mt-0.5 block text-xs text-muted-foreground/70">
                                    Sem modelo .docx
                                  </span>
                                )}
                              </div>
                              {template ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTemplate(task.id)}
                                  aria-label={`Remover modelo da etapa ${task.id}`}
                                >
                                  <X aria-hidden="true" className="size-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => pickTemplate(task.id)}
                                  aria-label={`Enviar modelo .docx para a etapa ${task.id}`}
                                  className="h-8 gap-1 px-2 text-xs text-primary hover:bg-primary/10"
                                >
                                  <FileUp aria-hidden="true" className="size-3.5" />
                                  Modelo
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTask(task.id)}
                                aria-label={`Remover etapa ${task.title}`}
                              >
                                <Trash2 aria-hidden="true" className="size-4" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
