import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ANALISTA_DOCS_KEY, formatBytes, type UploadedDoc } from "@/lib/analista-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analista/arquivos")({
  head: () => ({
    meta: [
      { title: "Base de Referências da Dona Norma | Painel do Analista" },
      {
        name: "description",
        content: "Envie os documentos PDF que a Dona Norma consulta para gerar respostas.",
      },
    ],
  }),
  component: Arquivos,
});

function Arquivos() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useLocalStorage<UploadedDoc[]>(ANALISTA_DOCS_KEY, []);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const pdfs = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (pdfs.length === 0) {
      toast.error("Apenas arquivos PDF são aceitos", {
        description: "Selecione um documento em formato .pdf",
      });
      return;
    }
    const entries: UploadedDoc[] = pdfs.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name}`,
      name: f.name,
      size: f.size,
      addedAt: new Date().toISOString(),
    }));
    setDocs((prev) => [...entries, ...(prev ?? [])]);
    toast.success("Documento enviado", {
      description: "Disponível na base de referências da Dona Norma.",
    });
  };

  const removeDoc = (id: string) => {
    setDocs((prev) => (prev ?? []).filter((d) => d.id !== id));
    toast("Documento removido da base");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Base de Referências da Dona Norma</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Envie os documentos que a Dona Norma consulta para embasar as respostas do chat.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Enviar documento</CardTitle>
          <CardDescription>
            Apenas arquivos .pdf são aceitos. O documento será enviado para a base da Dona Norma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/60 hover:bg-accent/50",
            )}
          >
            <UploadCloud aria-hidden="true" className="size-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              Clique para escolher ou arraste os PDFs aqui
            </span>
            <span className="text-xs text-muted-foreground">Somente arquivos .pdf</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Documentos na base da Dona Norma</CardTitle>
          <CardDescription>
            {docs.length === 0
              ? "Nenhum documento na base ainda."
              : `${docs.length} documento(s) disponível(is) para consulta.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileText aria-hidden="true" className="size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Os documentos enviados ficarão disponíveis para a Dona Norma consultar.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 rounded-md border px-3 py-2.5">
                  <FileText aria-hidden="true" className="size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(doc.size)} · {new Date(doc.addedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDoc(doc.id)}
                    aria-label={`Remover ${doc.name}`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
