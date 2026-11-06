import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/api";
import { CITIES, SPECIALIZATIONS } from "@/lib/constants";
import { RegisterPayload } from "@/services/authService";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    specialization: "",
    experience: "",
    fee: "",
    education: "",
    bio: "",
    clinicAddress: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        phone: form.phone || undefined,
        city: form.city || undefined,
      };
      if (role === "DOCTOR") {
        payload.specialization = form.specialization;
        payload.experience = form.experience ? Number(form.experience) : 0;
        payload.fee = form.fee ? Number(form.fee) : 0;
        payload.education = form.education;
        payload.bio = form.bio;
        payload.clinicAddress = form.clinicAddress;
      }
      const user = await register(payload);
      if (user.role === "DOCTOR") {
        toast.success("Account created! Your profile is pending admin approval.");
        navigate("/doctor");
      } else {
        toast.success("Account created successfully!");
        navigate("/patient");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join SehatBook today</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={role}
            onValueChange={(v) => setRole(v as "PATIENT" | "DOCTOR")}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="PATIENT">I'm a Patient</TabsTrigger>
              <TabsTrigger value="DOCTOR">I'm a Doctor</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="03xx-xxxxxxx"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "DOCTOR" && (
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Doctor details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select
                      value={form.specialization}
                      onValueChange={(v) => set("specialization", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min={0}
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fee">Consultation fee (Rs.)</Label>
                    <Input
                      id="fee"
                      type="number"
                      min={0}
                      value={form.fee}
                      onChange={(e) => set("fee", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      placeholder="MBBS, FCPS..."
                      value={form.education}
                      onChange={(e) => set("education", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clinic address</Label>
                  <Input
                    id="clinic"
                    value={form.clinicAddress}
                    onChange={(e) => set("clinicAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Short bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
