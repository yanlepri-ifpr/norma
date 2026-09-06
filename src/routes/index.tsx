import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checklist, type FinalStatus } from "@/components/Checklist";
import {
  DonaNormaChat,
  INITIAL_MESSAGES,
  type ChatMessage,
  type PendingAsk,
} from "@/components/DonaNormaChat";
import { PhaseNav } from "@/components/PhaseNav";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { FINAL_TASK_ID, PHASES, TASKS } from "@/lib/checklist-data";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Check-list de Compras Públicas | Painel do Demandante" },
      {
        name: "description",
        content:
          "Acompanhe as 16 etapas do processo de compras públicas, da demanda à validação jurídica, com a assistente virtual Dona Norma.",
      },
      { property: "og:title", content: "Check-list de Compras Públicas" },
      {
        property: "og:description",
        content:
          "Painel institucional para servidores acompanharem as 4 fases de criação de um edital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [completed, setCompleted] = useLocalStorage<number[]>("cpc:completed", []);
  const [attachments, setAttachments] = useLocalStorage<Record<number, string>>("cpc:anexos", {});
  const [finalStatus, setFinalStatus] = useLocalStorage<FinalStatus>("cpc:final", "pending");
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>("cpc:chat", INITIAL_MESSAGES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHidden, setChatHidden] = useState(true);
  const [pendingAsk, setPendingAsk] = useState<PendingAsk | null>(null);

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

  const askDonaNorma = (question: string, reply?: string) => {
    setPendingAsk({ key: Date.now(), text: question, ...(reply ? { reply } : {}) });
    setChatHidden(false);
    if (window.innerWidth < 1280) setChatOpen(true);
  };

  const approve = () => {
    setCompleted((prev) => (prev.includes(FINAL_TASK_ID) ? prev : [...prev, FINAL_TASK_ID]));
    setFinalStatus("approved");
    toast.success("Edital aprovado pelo Jurídico", {
      description: "Processo concluído em 100%.",
    });
  };

  const returnWithError = () => {
    setCompleted((prev) => prev.filter((id) => id < 15));
    setFinalStatus("returned");
    toast.error("Edital retornado com apontamentos", {
      description: "A etapa 15 foi reaberta para correção.",
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

  const resetChat = () => setMessages(() => INITIAL_MESSAGES);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <PhaseNav completed={completed} activeIndex={activeIndex} onSelectPhase={selectPhase} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Norma</p>
            <p className="text-xs text-primary-foreground/75">
              {completed.length} de {TASKS.length} tarefas concluídas
            </p>
          </div>
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
          onAsk={askDonaNorma}
          onApprove={approve}
          onReturn={returnWithError}
        />
      </main>



      {!chatHidden && (
        <aside className="hidden w-96 shrink-0 border-l xl:block">
          <div className="sticky top-0 h-screen">
            <DonaNormaChat
              messages={messages}
              onChange={setMessages}
              onReset={resetChat}
              pendingAsk={pendingAsk}
              onMinimize={() => setChatHidden(true)}
            />
          </div>
        </aside>
      )}

      {/* Chat retrátil em telas menores */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 xl:hidden">
          <div className="flex h-full w-full max-w-md flex-col bg-card shadow-xl">
            <div className="flex justify-end border-b p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatOpen(false)}
                aria-label="Fechar chat"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <DonaNormaChat
            messages={messages}
            onChange={setMessages}
            onReset={resetChat}
          />
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => {
          setChatHidden(false);
          setChatOpen(true);
        }}
        aria-label="Abrir chat da Dona Norma"
        className={cn(
          "fixed bottom-5 right-5 z-40 h-12 rounded-full shadow-lg",
          !chatHidden && "xl:hidden",
        )}
      >
        <MessageSquare aria-hidden="true" className="size-5" />
        Dona Norma
      </Button>
    </div>
  );
}
