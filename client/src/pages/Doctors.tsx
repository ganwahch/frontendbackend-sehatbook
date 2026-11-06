import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorCard } from "@/components/shared/DoctorCard";
import { getDoctors, DoctorFilters } from "@/services/doctorService";
import { CITIES, SPECIALIZATIONS } from "@/lib/constants";

const ANY = "any";

export default function Doctors() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [specialization, setSpecialization] = useState(
    searchParams.get("specialization") ?? ""
  );
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [maxFee, setMaxFee] = useState("");
  const [sort, setSort] = useState<"rating" | "fee" | "experience">("rating");

  // Debounce the free-text search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters: DoctorFilters = {
    search: debouncedSearch,
    specialization,
    city,
    maxFee,
    sort,
  };

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => getDoctors(filters),
  });

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setCity("");
    setMaxFee("");
    setSort("rating");
  };

  const hasFilters = search || specialization || city || maxFee;

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Find Doctors</h1>
        <p className="mt-1 text-muted-foreground">
          Browse verified doctors and book your appointment.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={specialization || ANY}
            onValueChange={(v) => setSpecialization(v === ANY ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All specializations</SelectItem>
              {SPECIALIZATIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={city || ANY}
            onValueChange={(v) => setCity(v === ANY ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All cities</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => setSort(v as typeof sort)}
          >
            <SelectTrigger>
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top rated</SelectItem>
              <SelectItem value="fee">Lowest fee</SelectItem>
              <SelectItem value="experience">Most experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Max fee:</span>
            <Input
              type="number"
              placeholder="e.g. 3000"
              className="h-9 w-32"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : doctors && doctors.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {doctors.length} doctor{doctors.length !== 1 && "s"} found
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No doctors found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
