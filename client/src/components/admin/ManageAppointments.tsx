import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getAdminAppointments } from "@/services/adminService";
import { STATUS_OPTIONS } from "@/lib/constants";
import { formatPKR } from "@/lib/utils";

const ALL = "all";

export function ManageAppointments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["adminAppointments", debounced, status, page],
    queryFn: () =>
      getAdminAppointments({ search: debounced, status, page, limit: 8 }),
  });

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or doctor..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={status || ALL}
            onValueChange={(v) => {
              setStatus(v === ALL ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.appointments.length > 0 ? (
                  data.appointments.map((apt) => (
                    <TableRow key={apt._id}>
                      <TableCell>
                        <div className="font-medium">{apt.patientName}</div>
                        <div className="text-xs text-muted-foreground">
                          {apt.patientEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{apt.doctorName}</div>
                        <div className="text-xs text-muted-foreground">
                          {apt.specialization}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(apt.date), "dd MMM yyyy")}
                        <div className="text-xs text-muted-foreground">
                          {apt.timeSlot}
                        </div>
                      </TableCell>
                      <TableCell>{formatPKR(apt.fee)}</TableCell>
                      <TableCell>
                        <StatusBadge status={apt.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {data && (
              <Pagination
                page={data.pagination.page}
                pages={data.pagination.pages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
