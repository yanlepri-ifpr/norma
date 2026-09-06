import {
  PHASES as SEED_PHASES_SOURCE,
  TASKS as SEED_TASKS_SOURCE,
  type Phase,
  type Task,
} from "@/lib/checklist-data";

export type { Phase, Task };

export type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  addedAt: string;
};

export type UploadedTemplate = UploadedDoc;

export const ANALISTA_PHASES_KEY = "analista:phases";
export const ANALISTA_TASKS_KEY = "analista:tasks";
export const ANALISTA_DOCS_KEY = "analista:docs";
export const ANALISTA_TEMPLATES_KEY = "analista:templates";

export const SEED_PHASES: Phase[] = SEED_PHASES_SOURCE.map((p) => ({ ...p }));
export const SEED_TASKS: Task[] = SEED_TASKS_SOURCE.map((t) => ({ ...t }));

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
