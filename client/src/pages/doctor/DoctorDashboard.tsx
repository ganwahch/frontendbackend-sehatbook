import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarDays,
  CalendarCheck,
  Wallet,
  Users,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getDoctorStats, getAppointments, updateAppointmentStatus } from "@/services/appointmentService";
import { getMyDoctorProfile, updateMyDoctorProfile } from "@/services/doctorService";
import { getApiErrorMessage } from "@/services/api";
import { WEEKDAYS } from "@/lib/constants";
import { cn, formatPKR } from "@/lib/utils";
import { Appointment, PopulatedPatient, AppointmentStatus } from "@/types";

function patientName(apt: Appointment): string {
  const p = apt.patientId as PopulatedPatient;
  return typeof p === "object" ? p.name : "Patient";
}

export default function DoctorDashboard() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["doctorStats"],
    queryFn: getDoctorStats,
  });

  const { data: appointments, isLoading: aptLoading } = useQuery({
    queryKey: ["appointments", "doctor"],
    queryFn: () => getAppointments(),
  });

  const { data: profile } = useQuery({
    queryKey: ["myDoctorProfile"],
    queryFn: getMyDoctorProfile,
  });

  const [availDays, setAvailDays] = useState<string[]>([]);
  const [savingAvail, setSavingAvail] = useState(false);

  useEffect(() => {
    if (profile) setAvailDays(profile.availableDays);
  }, [profile]);

  const changeStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctorStats"] });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const toggleDay = (day: string) =>
    setAvailDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const saveAvailability = async () => {
    setSavingAvail(true);
    try {
      await updateMyDoctorProfile({ availableDays: availDays });
      toast.success("Availability updated");
      queryClient.invalidateQueries({ queryKey: ["myDoctorProfile"] });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingAvail(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Doctor Dashboard
      </h1>

      {!profile?.isApproved && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Your profile is <strong>pending admin approval</strong>. Patients
          won't see you in search until an admin approves your account.
        </div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Appointments"
            value={stats?.totalAppointments ?? 0}
            icon={CalendarDays}
            tone="teal"
          />
          <StatCard
            label="Today"
            value={stats?.today ?? 0}
            icon={CalendarCheck}
            tone="sky"
          />
          <StatCard
            label="Earnings"
            value={formatPKR(stats?.earnings ?? 0)}
            icon={Wallet}
            tone="emerald"
          />
          <StatCard
            label="Patients"
            value={stats?.patients ?? 0}
            icon={Users}
            tone="amber"
          />
        </div>
      )}

      <Tabs defaultValue="appointments" className="mt-8">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Appointments */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {aptLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : appointments && appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt._id}>
                        <TableCell className="font-medium">
                          {patientName(apt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(apt.date), "dd MMM")} · {apt.timeSlot}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {apt.reason}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={apt.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {apt.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    changeStatus(apt._id, "Confirmed")
                                  }
                                >
                                  <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive"
                                  onClick={() =>
                                    changeStatus(apt._id, "Cancelled")
                                  }
                                >
                                  <X className="h-4 w-4" /> Reject
                                </Button>
                              </>
                            )}
                            {apt.status === "Confirmed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  changeStatus(apt._id, "Completed")
                                }
                              >
                                Mark completed
                              </Button>
                            )}
                            {["Completed", "Cancelled"].includes(apt.status) && (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No appointments yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Select the days you are available for appointments.
              </p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const active = availDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary hover:text-primary"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <Button onClick={saveAvailability} disabled={savingAvail}>
                {savingAvail && <Loader2 className="h-4 w-4 animate-spin" />}
                Save availability
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
