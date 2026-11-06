import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { DoctorProfile } from "../models/DoctorProfile";
import { Appointment } from "../models/Appointment";
import { Review } from "../models/Review";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DoctorSeed {
  name: string;
  email: string;
  city: string;
  phone: string;
  specialization: string;
  experience: number;
  fee: number;
  education: string;
  bio: string;
  clinicAddress: string;
  availableDays: string[];
  rating: number;
  ratingCount: number;
}

const doctors: DoctorSeed[] = [
  {
    name: "Dr. Ayesha Khan",
    email: "ayesha.khan@sehatbook.pk",
    city: "Karachi",
    phone: "0300-1112233",
    specialization: "Cardiologist",
    experience: 12,
    fee: 3000,
    education: "MBBS, FCPS (Cardiology) - Aga Khan University",
    bio: "Senior consultant cardiologist with over a decade of experience in interventional cardiology and preventive heart care.",
    clinicAddress: "Clifton Medical Centre, Block 5, Karachi",
    availableDays: ["Mon", "Tue", "Wed", "Thu"],
    rating: 4.8,
    ratingCount: 2,
  },
  {
    name: "Dr. Bilal Ahmed",
    email: "bilal.ahmed@sehatbook.pk",
    city: "Lahore",
    phone: "0301-2223344",
    specialization: "Dermatologist",
    experience: 8,
    fee: 2000,
    education: "MBBS, MD (Dermatology) - King Edward Medical University",
    bio: "Skin specialist focused on acne, eczema, and cosmetic dermatology with a gentle, patient-first approach.",
    clinicAddress: "Gulberg Skin Clinic, MM Alam Road, Lahore",
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    rating: 4.5,
    ratingCount: 1,
  },
  {
    name: "Dr. Sana Malik",
    email: "sana.malik@sehatbook.pk",
    city: "Islamabad",
    phone: "0302-3334455",
    specialization: "Gynecologist",
    experience: 15,
    fee: 2500,
    education: "MBBS, FCPS (Gynaecology) - Shifa College of Medicine",
    bio: "Experienced gynecologist specializing in maternal health, prenatal care, and women's wellness.",
    clinicAddress: "Shifa International, H-8/4, Islamabad",
    availableDays: ["Tue", "Thu", "Sat"],
    rating: 4.9,
    ratingCount: 0,
  },
  {
    name: "Dr. Hamza Sheikh",
    email: "hamza.sheikh@sehatbook.pk",
    city: "Karachi",
    phone: "0303-4445566",
    specialization: "Neurologist",
    experience: 10,
    fee: 3500,
    education: "MBBS, FCPS (Neurology) - Dow University of Health Sciences",
    bio: "Neurologist treating migraines, epilepsy, and neurological disorders with evidence-based care.",
    clinicAddress: "Dow Medical Complex, Gulshan, Karachi",
    availableDays: ["Mon", "Tue", "Thu", "Fri"],
    rating: 4.6,
    ratingCount: 0,
  },
  {
    name: "Dr. Fatima Noor",
    email: "fatima.noor@sehatbook.pk",
    city: "Lahore",
    phone: "0304-5556677",
    specialization: "Pediatrician",
    experience: 9,
    fee: 1800,
    education: "MBBS, DCH - Fatima Memorial Hospital",
    bio: "Caring pediatrician with special interest in child nutrition, vaccination, and newborn care.",
    clinicAddress: "Johar Town Children's Clinic, Lahore",
    availableDays: ["Mon", "Tue", "Wed", "Fri", "Sat"],
    rating: 4.7,
    ratingCount: 0,
  },
  {
    name: "Dr. Usman Tariq",
    email: "usman.tariq@sehatbook.pk",
    city: "Islamabad",
    phone: "0305-6667788",
    specialization: "Orthopedic Surgeon",
    experience: 14,
    fee: 3200,
    education: "MBBS, FCPS (Orthopedics) - PIMS Islamabad",
    bio: "Orthopedic surgeon specializing in joint replacement, sports injuries, and fracture management.",
    clinicAddress: "PIMS Bone & Joint Centre, G-8, Islamabad",
    availableDays: ["Wed", "Thu", "Fri"],
    rating: 4.4,
    ratingCount: 0,
  },
  {
    name: "Dr. Zainab Raza",
    email: "zainab.raza@sehatbook.pk",
    city: "Karachi",
    phone: "0306-7778899",
    specialization: "Psychiatrist",
    experience: 7,
    fee: 2800,
    education: "MBBS, MCPS (Psychiatry) - Jinnah Medical College",
    bio: "Psychiatrist offering compassionate care for anxiety, depression, and stress-related conditions.",
    clinicAddress: "Mind Care Clinic, PECHS, Karachi",
    availableDays: ["Mon", "Wed", "Sat"],
    rating: 4.8,
    ratingCount: 0,
  },
  {
    name: "Dr. Imran Qureshi",
    email: "imran.qureshi@sehatbook.pk",
    city: "Lahore",
    phone: "0307-8889900",
    specialization: "Dentist",
    experience: 11,
    fee: 1500,
    education: "BDS, FCPS (Operative Dentistry) - de'Montmorency College",
    bio: "Dental surgeon providing cosmetic dentistry, root canal treatment, and painless extractions.",
    clinicAddress: "Smile Dental Studio, DHA Phase 4, Lahore",
    availableDays: ["Tue", "Thu", "Fri", "Sat"],
    rating: 4.3,
    ratingCount: 0,
  },
];

async function seed(): Promise<void> {
  await connectDB();

  console.log("🧹 Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    DoctorProfile.deleteMany({}),
    Appointment.deleteMany({}),
    Review.deleteMany({}),
  ]);

  // --- Admin ---
  const admin = await User.create({
    name: "SehatBook Admin",
    email: "admin@sehatbook.pk",
    password: "admin123",
    role: "ADMIN",
    phone: "0300-0000000",
    city: "Islamabad",
  });
  console.log(`👑 Admin created: ${admin.email} / admin123`);

  // --- Patients ---
  const patients = await User.create([
    {
      name: "Ali Hassan",
      email: "ali@sehatbook.pk",
      password: "patient123",
      role: "PATIENT",
      phone: "0311-1234567",
      city: "Karachi",
    },
    {
      name: "Maria Jamil",
      email: "maria@sehatbook.pk",
      password: "patient123",
      role: "PATIENT",
      phone: "0312-7654321",
      city: "Lahore",
    },
  ]);
  console.log(`🧑‍🤝‍🧑 ${patients.length} patients created (password: patient123)`);

  // --- Doctors ---
  const createdProfiles: { profileId: mongoose.Types.ObjectId; fee: number }[] =
    [];

  for (const doc of doctors) {
    const user = await User.create({
      name: doc.name,
      email: doc.email,
      password: "doctor123",
      role: "DOCTOR",
      phone: doc.phone,
      city: doc.city,
    });

    const profile = await DoctorProfile.create({
      userId: user._id,
      specialization: doc.specialization,
      experience: doc.experience,
      fee: doc.fee,
      bio: doc.bio,
      education: doc.education,
      clinicAddress: doc.clinicAddress,
      availableDays: doc.availableDays,
      rating: doc.rating,
      ratingCount: doc.ratingCount,
      isApproved: true,
    });

    createdProfiles.push({ profileId: profile._id, fee: doc.fee });
  }
  console.log(`🩺 ${doctors.length} doctors created (password: doctor123)`);

  // --- A few appointments (incl. completed ones so reviews are valid) ---
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dr1 = createdProfiles[0];
  const dr2 = createdProfiles[1];

  const [aptCompleted1] = await Appointment.create([
    {
      patientId: patients[0]._id,
      doctorId: dr1.profileId,
      date: fmt(yesterday),
      timeSlot: "10:00 AM",
      reason: "Chest pain and routine ECG",
      status: "Completed",
      fee: dr1.fee,
    },
  ]);

  await Appointment.create([
    {
      patientId: patients[1]._id,
      doctorId: dr1.profileId,
      date: fmt(yesterday),
      timeSlot: "11:00 AM",
      reason: "Follow-up on blood pressure",
      status: "Completed",
      fee: dr1.fee,
    },
    {
      patientId: patients[0]._id,
      doctorId: dr2.profileId,
      date: fmt(yesterday),
      timeSlot: "03:00 PM",
      reason: "Acne consultation",
      status: "Completed",
      fee: dr2.fee,
    },
    {
      patientId: patients[0]._id,
      doctorId: dr1.profileId,
      date: fmt(tomorrow),
      timeSlot: "12:00 PM",
      reason: "Routine heart checkup",
      status: "Pending",
      fee: dr1.fee,
    },
    {
      patientId: patients[1]._id,
      doctorId: createdProfiles[2].profileId,
      date: fmt(today),
      timeSlot: "02:00 PM",
      reason: "Prenatal consultation",
      status: "Confirmed",
      fee: createdProfiles[2].fee,
    },
  ]);

  // --- Reviews (match the rating/ratingCount seeded above) ---
  await Review.create([
    {
      doctorId: dr1.profileId,
      patientId: patients[0]._id,
      rating: 5,
      comment: "Excellent doctor, explained everything clearly. Highly recommended!",
    },
    {
      doctorId: dr1.profileId,
      patientId: patients[1]._id,
      rating: 4.5,
      comment: "Very professional and caring. The clinic was clean and modern.",
    },
    {
      doctorId: dr2.profileId,
      patientId: patients[0]._id,
      rating: 4.5,
      comment: "My skin improved a lot after following the treatment plan.",
    },
  ]);

  console.log("📅 Sample appointments + reviews created");
  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin   -> admin@sehatbook.pk   / admin123");
  console.log("  Doctor  -> ayesha.khan@sehatbook.pk / doctor123");
  console.log("  Patient -> ali@sehatbook.pk      / patient123");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
