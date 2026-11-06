import { Link } from "react-router-dom";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { DoctorListItem } from "@/types";
import { formatPKR, initials } from "@/lib/utils";

export function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={doctor.avatar} alt={doctor.name} />
            <AvatarFallback className="text-lg">
              {initials(doctor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{doctor.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {doctor.specialization}
            </Badge>
            <div className="mt-2">
              <StarRating
                value={doctor.rating}
                showValue
                count={doctor.ratingCount}
                size={14}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>{doctor.experience} years experience</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{doctor.city}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Consultation</p>
          <p className="font-semibold text-primary">{formatPKR(doctor.fee)}</p>
        </div>
        <Button size="sm" asChild>
          <Link to={`/doctors/${doctor._id}`}>
            View <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
