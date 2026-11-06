import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, formatPKR } from "@/lib/utils";
import { TIME_SLOTS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import {
  createAppointment,
  getBookedSlots,
} from "@/services/appointmentService";
import { getApiErrorMessage } from "@/services/api";
import { DoctorListItem } from "@/types";

interface Props {
  doctor: DoctorListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookAppointmentDialog({ doctor, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";

  const { data: bookedSlots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ["bookedSlots", doctor._id, dateStr],
    queryFn: () => getBookedSlots(doctor._id, dateStr),
    enabled: Boolean(dateStr),
  });

  const reset = () => {
    setDate(undefined);
    setSlot("");
    setReason("");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.info("Please login to book an appointment");
      navigate("/login");
      return;
    }
    if (user.role !== "PATIENT") {
      toast.error("Only patients can book appointments");
      return;
    }
    if (!dateStr || !slot || reason.trim().length < 3) {
      toast.error("Please select a date, time slot and reason");
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        doctorId: doctor._id,
        date: dateStr,
        timeSlot: slot,
        reason: reason.trim(),
      });
      toast.success("Appointment booked! Waiting for doctor confirmation.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      reset();
      onOpenChange(false);
      navigate("/patient/appointments");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book appointment</DialogTitle>
          <DialogDescription>
            with {doctor.name} · {formatPKR(doctor.fee)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Select date
            </Label>
            <div className="flex justify-center rounded-lg border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setSlot("");
                }}
                disabled={(d) =>
                  d < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </div>
          </div>

          {/* Time slots */}
          {dateStr && (
            <div className="space-y-2">
              <Label>Available time slots</Label>
              {loadingSlots ? (
                <p className="text-sm text-muted-foreground">Loading slots…</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const taken = bookedSlots.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={taken}
                        onClick={() => setSlot(t)}
                        className={cn(
                          "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                          taken &&
                            "cursor-not-allowed border-dashed text-muted-foreground/50 line-through",
                          !taken &&
                            slot === t &&
                            "border-primary bg-primary text-primary-foreground",
                          !taken &&
                            slot !== t &&
                            "hover:border-primary hover:text-primary"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for visit</Label>
            <Textarea
              id="reason"
              placeholder="Describe your symptoms or reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
