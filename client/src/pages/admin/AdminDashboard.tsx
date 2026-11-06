import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users as UsersIcon,
  Stethoscope,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { AppointmentsChart } from "@/components/admin/AppointmentsChart";
import { StatusChart } from "@/components/admin/StatusChart";
import { ManageDoctors } from "@/components/admin/ManageDoctors";
import { ManageUsers } from "@/components/admin/ManageUsers";
import { ManageAppointments } from "@/components/admin/ManageAppointments";
import { getAdminStats } from "@/services/adminService";
import { formatPKR } from "@/lib/utils";

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Admin Dashboard
      </h1>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={data?.stats.totalUsers ?? 0}
            icon={UsersIcon}
            tone="teal"
          />
          <StatCard
            label="Doctors"
            value={data?.stats.totalDoctors ?? 0}
            icon={Stethoscope}
            tone="sky"
          />
          <StatCard
            label="Appointments"
            value={data?.stats.totalAppointments ?? 0}
            icon={CalendarDays}
            tone="amber"
          />
          <StatCard
            label="Revenue"
            value={formatPKR(data?.stats.revenue ?? 0)}
            icon={Wallet}
            tone="emerald"
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  Appointments this week
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <AppointmentsChart data={data?.appointmentsPerWeek ?? []} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">By status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <StatusChart data={data?.statusBreakdown ?? []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="doctors">
          <ManageDoctors />
        </TabsContent>
        <TabsContent value="users">
          <ManageUsers />
        </TabsContent>
        <TabsContent value="appointments">
          <ManageAppointments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
