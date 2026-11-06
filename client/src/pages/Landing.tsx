import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  CalendarCheck,
  UserCheck,
  Star,
  ShieldCheck,
  Clock,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorCard } from "@/components/shared/DoctorCard";
import { getDoctors } from "@/services/doctorService";
import { CITIES, SPECIALIZATIONS } from "@/lib/constants";

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");

  const { data: topDoctors, isLoading } = useQuery({
    queryKey: ["doctors", "top"],
    queryFn: () => getDoctors({ sort: "rating" }),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (specialization) params.set("specialization", specialization);
    if (city) params.set("city", city);
    navigate(`/doctors?${params.toString()}`);
  };

  const steps = [
    {
      icon: Search,
      title: "Find a doctor",
      desc: "Search by specialization, city or name and compare top-rated doctors.",
    },
    {
      icon: CalendarCheck,
      title: "Book appointment",
      desc: "Pick a date and an available time slot in just a few clicks.",
    },
    {
      icon: UserCheck,
      title: "Visit & review",
      desc: "Meet your doctor, get treated, then share your experience.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Pakistan's trusted doctor booking platform
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your health, <span className="text-primary">booked</span> in
              seconds.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Find verified doctors across Karachi, Lahore and Islamabad and
              book clinic appointments online — anytime, anywhere.
            </p>

            {/* Search box */}
            <div className="mt-8 grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search doctor by name..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="sm:col-span-2" onClick={handleSearch}>
                <Search className="h-4 w-4" /> Search Doctors
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative grid gap-4">
              <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8+</p>
                  <p className="text-sm text-muted-foreground">Verified doctors</p>
                </div>
              </div>
              <div className="ml-10 flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.8★</p>
                  <p className="text-sm text-muted-foreground">Average rating</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Online booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top doctors */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Top rated doctors
            </h2>
            <p className="mt-1 text-muted-foreground">
              Highly rated specialists trusted by patients.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/doctors")}>
            View all
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))
            : topDoctors
                ?.slice(0, 4)
                .map((doc) => <DoctorCard key={doc._id} doctor={doc} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Booking a doctor has never been this simple.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mt-2 text-sm font-semibold text-primary">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
