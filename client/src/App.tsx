import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/shared/Layout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

import Landing from "@/pages/Landing";
import Doctors from "@/pages/Doctors";
import DoctorDetail from "@/pages/DoctorDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import MyAppointments from "@/pages/patient/MyAppointments";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Any authenticated user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Patient */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute roles={["PATIENT"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute roles={["PATIENT"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
