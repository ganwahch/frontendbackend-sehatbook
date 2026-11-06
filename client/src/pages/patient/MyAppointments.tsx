import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, CalendarX, Star, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReviewDialog } from "@/components/shared/ReviewDialog";
import {
  getAppointments,
  cancelAppointment,
} from "@/services/appointmentService";
import { getApiErrorMessage } from "@/services/api";
import { Appointment, PopulatedDoctor } from "@/types";
import { formatPKR, initials } from "@/lib/utils";

function doctorOf(apt: Appointment): {
  id: string;
  name: string;
  specialization: string;
} {
  const d = apt.doctorId as PopulatedDoctor;
  if (typeof d === "object" && d.userId) {
    return {
      id: d._id,
      name: d.userId.name,
      specialization: d.specialization,
    };
  }
  return { id: String(apt.doctorId), name: "Doctor", specialization: "" };
}

export default function MyAppointments() {
  const queryClient = useQueryClient();
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: () => getAppointments(),
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const upcoming =
    appointments?.filter((a) =>
      ["Pending", "Confirmed"].includes(a.status)
    ) ?? [];
  const past = appointments?.filter((a) => a.status === "Completed") ?? [];
  const cancelled =
    appointments?.filter((a) => a.status === "Cancelled") ?? [];

  const renderCard = (apt: Appointment) => {
    const doc = doctorOf(apt);
    return (
      <Card key={apt._id}>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border">
              <AvatarFallback>{initials(doc.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{doc.name}</p>
                <StatusBadge status={apt.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {doc.specialization}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {format(new Date(apt.date), "dd MMM yyyy")} · {apt.timeSlot}
                </span>
                <span>{formatPKR(apt.fee)}</span>
              </div>
              <p className="mt-1 text-sm">
                <span className="text-muted-foreground">Reason: </span>
                {apt.reason}
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col">
            {["Pending", "Confirmed"].includes(apt.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(apt._id)}
              >
                Cancel
              </Button>
            )}
            {apt.status === "Completed" && (
              <Button
                size="sm"
                onClick={() =>
                  setReviewTarget({ id: doc.id, name: doc.name })
                }
              >
                <Star className="h-4 w-4" /> Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const emptyState = (label: string) => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <CalendarX className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="font-medium">No {label} appointments</p>
    </div>
  );

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-3">
        <Stethoscope className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length ? upcoming.map(renderCard) : emptyState("upcoming")}
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            {past.length ? past.map(renderCard) : emptyState("past")}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-4">
            {cancelled.length
              ? cancelled.map(renderCard)
              : emptyState("cancelled")}
          </TabsContent>
        </Tabs>
      )}

      {reviewTarget && (
        <ReviewDialog
          doctorId={reviewTarget.id}
          doctorName={reviewTarget.name}
          open={Boolean(reviewTarget)}
          onOpenChange={(o) => !o && setReviewTarget(null)}
        />
      )}
    </div>
  );
}
