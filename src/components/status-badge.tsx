import { Badge } from "@/components/ui/badge";
import type { PipelineStatus } from "@/lib/alpha/types";

const MAP: Record<PipelineStatus, { label: string; variant: "mute" | "info" | "warn" | "pass" | "fail" }> = {
  extracted: { label: "Extracted", variant: "mute" },
  enriching: { label: "Enriching", variant: "info" },
  analyzing: { label: "Analyzing", variant: "warn" },
  scored: { label: "Scored", variant: "info" },
  passed: { label: "Passed", variant: "pass" },
  rejected: { label: "Rejected", variant: "fail" },
};

export function StatusBadge({ status }: { status: PipelineStatus }) {
  const item = MAP[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
