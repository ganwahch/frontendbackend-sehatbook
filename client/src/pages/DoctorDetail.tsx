import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar as CalIcon,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/StarRating";
import { BookAppointmentDialog } from "@/components/shared/BookAppointmentDialog";
import { getDoctorById } from "@/services/doctorService";
import { formatPKR, initials } from "@/lib/utils";

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookOpen, setBookOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctorById(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container flex flex-col items-center py-20 text-center">
        <p className="text-lg font-medium">Doctor not found</p>
        <Button className="mt-4" onClick={() => navigate("/doctors")}>
          Back to doctors
        </Button>
      </div>
    );
  }

  const { doctor, reviews } = data;

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header card */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-28 w-28 border">
            <AvatarImage src={doctor.avatar} alt={doctor.name} />
            <AvatarFallback className="text-2xl">
              {initials(doctor.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{doctor.name}</h1>
            <Badge variant="secondary" className="mt-1">
              {doctor.specialization}
            </Badge>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <StarRating
                value={doctor.rating}
                showValue
                count={doctor.ratingCount}
              />
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {doctor.experience} yrs exp
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {doctor.city}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Consultation fee</p>
              <p className="text-2xl font-bold text-primary">
                {formatPKR(doctor.fee)}
              </p>
            </div>
            <Button size="lg" onClick={() => setBookOpen(true)}>
              <CalIcon className="h-4 w-4" /> Book Appointment
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="leading-relaxed text-muted-foreground">
                {doctor.bio || "No bio available."}
              </p>
              <Separator />
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Education</p>
                  <p className="text-muted-foreground">
                    {doctor.education || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Clinic</p>
                  <p className="text-muted-foreground">
                    {doctor.clinicAddress || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" /> Patient Reviews
                <span className="text-sm font-normal text-muted-foreground">
                  ({reviews.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first after your appointment!
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={r.patientAvatar} />
                          <AvatarFallback>
                            {initials(r.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{r.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(r.createdAt), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <StarRating value={r.rating} size={14} />
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Availability sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              {doctor.availableDays.length ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.availableDays.map((d) => (
                    <Badge key={d} variant="outline">
                      {d}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Availability not set.
                </p>
              )}
              <Button className="mt-5 w-full" onClick={() => setBookOpen(true)}>
                <CalIcon className="h-4 w-4" /> Book now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookAppointmentDialog
        doctor={doctor}
        open={bookOpen}
        onOpenChange={setBookOpen}
      />
    </div>
  );
}
