import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { FileText, FolderTree, LayoutDashboard, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analista")({
  head: () => ({
    meta: [
      { title: "Painel do Analista | Compras Públicas" },
      {
        name: "description",
        content:
          "Gerencie os documentos de referência e a estrutura de fases e etapas do checklist de compras públicas.",
      },
    ],
  }),
  component: AnalistaLayout,
});

const NAV_ITEMS = [
  { to: "/analista", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { to: "/analista/arquivos", label: "Arquivos", icon: FileText, exact: false },
  { to: "/analista/checklist", label: "Checklist", icon: FolderTree, exact: false },
] as const;

function AnalistaLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <nav aria-label="Navegação do analista" className="flex h-full flex-col gap-6 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Scale aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Compras Públicas</p>
                <p className="text-xs text-sidebar-foreground/70">Painel do Analista</p>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const to = item.to.replace(/\/+$/, "");
                const isActive = item.exact ? pathname === to : pathname.startsWith(to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md border border-transparent px-3 py-3 text-sm font-medium transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        isActive &&
                          "border-sidebar-border bg-sidebar-accent text-sidebar-foreground",
                        !isActive && "text-sidebar-foreground/80",
                      )}
                    >
                      <item.icon aria-hidden="true" className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="mt-auto text-xs leading-relaxed text-sidebar-foreground/60">
              Ambiente do analista para envio de documentos à base da Dona Norma e gestão da
              estrutura do checklist de compras públicas.
            </p>
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b bg-primary px-4 py-3 text-primary-foreground">
          <p className="text-sm font-semibold">Painel do Analista</p>
          <p className="text-xs text-primary-foreground/75">Gestão de arquivos e checklist</p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b bg-card px-4 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const to = item.to.replace(/\/+$/, "");
            const isActive = item.exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-sidebar-border bg-sidebar-accent text-sidebar-foreground"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
