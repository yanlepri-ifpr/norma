import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, FolderTree } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  ANALISTA_DOCS_KEY,
  ANALISTA_PHASES_KEY,
  ANALISTA_TASKS_KEY,
  SEED_PHASES,
  SEED_TASKS,
  type Phase,
  type Task,
  type UploadedDoc,
} from "@/lib/analista-data";

export const Route = createFileRoute("/analista/")({
  head: () => ({
    meta: [
      { title: "Visão Geral | Painel do Analista" },
      {
        name: "description",
        content:
          "Painel do analista para gerenciar documentos de referência e a estrutura do checklist de compras públicas.",
      },
    ],
  }),
  component: AnalistaIndex,
});

function AnalistaIndex() {
  const [docs] = useLocalStorage<UploadedDoc[]>(ANALISTA_DOCS_KEY, []);
  const [phases] = useLocalStorage<Phase[]>(ANALISTA_PHASES_KEY, SEED_PHASES);
  const [tasks] = useLocalStorage<Task[]>(ANALISTA_TASKS_KEY, SEED_TASKS);

  const phasesList = phases ?? [];
  const tasksList = tasks ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gerencie os documentos de referência e a estrutura do checklist de compras públicas.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          to="/analista/arquivos"
          className="group rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition-colors group-hover:border-primary/60">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText aria-hidden="true" className="size-5" />
              </span>
              <CardTitle>Base de Referências da Dona Norma</CardTitle>
              <CardDescription>
                Envie os documentos PDF que a Dona Norma consulta para gerar respostas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {docs.length === 0
                  ? "Nenhum documento na base"
                  : `${docs.length} documento(s) na base`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          to="/analista/checklist"
          className="group rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition-colors group-hover:border-primary/60">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FolderTree aria-hidden="true" className="size-5" />
              </span>
              <CardTitle>Estrutura do Checklist</CardTitle>
              <CardDescription>Crie e organize as fases e as etapas do checklist.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {phasesList.length === 0 && tasksList.length === 0
                  ? "Checklist vazio"
                  : `${phasesList.length} fase(s) e ${tasksList.length} etapa(s)`}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
