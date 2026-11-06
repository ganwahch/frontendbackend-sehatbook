import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { getAppointments } from "@/services/appointmentService";
import { Appointment, PopulatedDoctor } from "@/types";

function doctorName(apt: Appointment): string {
  const d = apt.doctorId as PopulatedDoctor;
  return typeof d === "object" && d.userId ? d.userId.name : "Doctor";
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: () => getAppointments(),
  });

  const upcoming =
    appointments?.filter((a) => ["Pending", "Confirmed"].includes(a.status)) ??
    [];
  const completed = appointments?.filter((a) => a.status === "Completed") ?? [];
  const cancelled = appointments?.filter((a) => a.status === "Cancelled") ?? [];

  const recent = [...(appointments ?? [])].slice(0, 5);

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {user?.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your appointments.
          </p>
        </div>
        <Button asChild>
          <Link to="/doctors">
            <CalendarPlus className="h-4 w-4" /> Book appointment
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Upcoming"
            value={upcoming.length}
            icon={CalendarClock}
            tone="teal"
          />
          <StatCard
            label="Completed"
            value={completed.length}
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            label="Cancelled"
            value={cancelled.length}
            icon={XCircle}
            tone="amber"
          />
        </div>
      )}

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent appointments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/patient/appointments">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No appointments yet.{" "}
              <Link to="/doctors" className="text-primary hover:underline">
                Find a doctor
              </Link>
            </p>
          ) : (
            <div className="divide-y">
              {recent.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium">{doctorName(apt)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(apt.date), "dd MMM yyyy")} ·{" "}
                      {apt.timeSlot}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
