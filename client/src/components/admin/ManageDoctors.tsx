import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Trash2, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAdminDoctors,
  setDoctorApproval,
  deleteDoctor,
} from "@/services/adminService";
import { getApiErrorMessage } from "@/services/api";
import { formatPKR } from "@/lib/utils";

export function ManageDoctors() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["adminDoctors", search],
    queryFn: () => getAdminDoctors({ search }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
    queryClient.invalidateQueries({ queryKey: ["adminStats"] });
  };

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      await setDoctorApproval(id, approve);
      toast.success(approve ? "Doctor approved" : "Doctor unapproved");
      refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoctor(deleteId);
      toast.success("Doctor deleted");
      setDeleteId(null);
      refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors && doctors.length > 0 ? (
                doctors.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.email}
                      </div>
                    </TableCell>
                    <TableCell>{doc.specialization}</TableCell>
                    <TableCell>{formatPKR(doc.fee)}</TableCell>
                    <TableCell>
                      {doc.isApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {doc.isApproved ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(doc._id, false)}
                          >
                            <X className="h-4 w-4" /> Unapprove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(doc._id, true)}
                          >
                            <Check className="h-4 w-4" /> Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => setDeleteId(doc._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No doctors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete doctor?</DialogTitle>
            <DialogDescription>
              This permanently removes the doctor, their appointments and
              reviews. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
