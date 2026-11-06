import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types";

const MAP: Record<
  AppointmentStatus,
  "warning" | "info" | "success" | "destructive"
> = {
  Pending: "warning",
  Confirmed: "info",
  Completed: "success",
  Cancelled: "destructive",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={MAP[status]}>{status}</Badge>;
}
