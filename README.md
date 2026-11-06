# SehatBook — Doctor Appointment & Clinic Management System

A full-stack MERN-style app for booking doctor appointments and managing a clinic,
with three roles: **Admin, Doctor, Patient**.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui + React Router + TanStack Query + Axios + Recharts
- **Backend:** Node.js + Express + TypeScript + MongoDB + Mongoose + JWT + bcryptjs + Zod

## Project Structure

```
finalProject_backend-frontend/
├── server/                 # Backend (Express + MongoDB)
│   └── src/
│       ├── config/         # env + db connection
│       ├── controllers/    # auth, doctor, appointment, review, admin
│       ├── middlewares/     # protect/authorize, validate, errorHandler
│       ├── models/         # User, DoctorProfile, Appointment, Review
│       ├── routes/         # route modules
│       ├── utils/          # ApiError, jwt, catchAsync, seed
│       └── validators/     # Zod schemas
└── client/                 # Frontend (React + Vite)
    └── src/
        ├── components/     # ui/ (shadcn), shared/, admin/
        ├── hooks/          # useAuth, useTheme
        ├── pages/          # public, patient, doctor, admin
        ├── services/       # axios API layer
        └── types/          # shared TypeScript types
```

## Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas URI)

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # then edit if needed (Mongo URI / JWT secret)
npm run seed              # seeds 8 doctors + admin + patients + sample data
npm run dev               # starts on http://localhost:5000
```

> Using **MongoDB Atlas**? Just set `MONGO_URI` in `server/.env` to your Atlas
> connection string — no code changes needed.

### 2. Frontend

```bash
cd client
npm install
npm run dev               # starts on http://localhost:5173
```

Vite proxies all `/api` requests to the backend at `http://localhost:5000`.

## Demo Accounts (after `npm run seed`)

| Role    | Email                        | Password     |
| ------- | ---------------------------- | ------------ |
| Admin   | `admin@sehatbook.pk`         | `admin123`   |
| Doctor  | `ayesha.khan@sehatbook.pk`   | `doctor123`  |
| Patient | `ali@sehatbook.pk`           | `patient123` |

(All seeded doctors use password `doctor123`; all seeded patients use `patient123`.)

## Features

**Auth** — register/login with JWT + bcrypt, role-based protected routes, profile edit, dark mode.

**Public** — landing page (hero/search/top doctors/how it works), doctors listing with
search + filters (specialization, city, max fee) + sort (rating/fee/experience),
doctor detail page with bio, reviews and booking.

**Patient** — dashboard, book appointment (date + time slot + reason, with booked-slot
blocking), my appointments (upcoming/past/cancelled, cancel), add review after a
completed appointment.

**Doctor** — stats (total/today/earnings/patients), manage weekly availability,
approve / reject / complete appointments.

**Admin** — stats (users/doctors/appointments/revenue), charts (appointments this week,
by status), manage doctors (approve/delete), manage users (search + pagination + delete),
manage appointments (search + status filter + pagination).

## Key API Endpoints

| Method | Endpoint                          | Access  |
| ------ | --------------------------------- | ------- |
| POST   | `/api/auth/register`              | Public  |
| POST   | `/api/auth/login`                 | Public  |
| GET    | `/api/auth/me`                    | Auth    |
| GET    | `/api/doctors`                    | Public  |
| GET    | `/api/doctors/:id`                | Public  |
| POST   | `/api/appointments`               | Patient |
| GET    | `/api/appointments`               | Auth    |
| PUT    | `/api/appointments/:id/status`    | Auth    |
| DELETE | `/api/appointments/:id`           | Auth    |
| POST   | `/api/reviews`                    | Patient |
| GET    | `/api/admin/stats`                | Admin   |

### Double-booking protection

A partial **unique index** on `(doctorId, date, timeSlot)` for active appointments
(`Pending`/`Confirmed`/`Completed`) guarantees the same doctor can't be booked twice
for the same slot. Cancelled appointments free the slot again. The controller also
does an explicit check for a friendly error message.
