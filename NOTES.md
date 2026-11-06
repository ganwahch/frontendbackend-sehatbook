# SehatBook — Revision Notes (Viva / Exam)

> Doctor Appointment & Clinic Management System · MERN + TypeScript
> Short notes yaad karne ke liye. Detail wali guide alag hai.

---

## 1. One-line definition

SehatBook ek **full-stack doctor appointment booking system** hai with 3 roles —
**Patient, Doctor, Admin** — jo **MERN stack (MongoDB, Express, React, Node) +
TypeScript** pe bana hai.

---

## 2. Tech stack (yaad karo)

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, TypeScript, Tailwind, shadcn/ui, React Router, TanStack Query, Axios, Recharts |
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, Zod |

**MERN** = **M**ongoDB + **E**xpress + **R**eact + **N**ode.

---

## 3. Architecture (kaise connected hai)

```
React (5173)  →  Axios /api + JWT  →  Express API (5000)  →  Mongoose  →  MongoDB
```

- Frontend sirf **UI** banata hai + API se data maangta hai.
- Backend **logic + database** handle karta hai.
- Dono ke beech **JSON** travel karta hai.
- Vite **proxy** `/api` ko backend pe bhejta hai (CORS problem nahi).

---

## 4. Backend request lifecycle

```
Route  →  Middleware  →  Controller  →  Model  →  MongoDB
```

- **Route** – URL ko controller se jodta hai (`POST /api/auth/login`).
- **Middleware** – `protect` (JWT check), `authorize` (role check), `validate` (Zod input check).
- **Controller** – asli logic: DB se data laana/save karna, JSON response.
- **Model** – Mongoose schema = database ka shape.

**Models (4):** `User`, `DoctorProfile`, `Appointment`, `Review`.

---

## 5. Frontend key parts

- **Pages + React Router** – har URL = ek page. `ProtectedRoute` login/role check karta hai.
- **Services (Axios)** – saari API calls; interceptor har request mein JWT lagata hai.
- **TanStack Query** – data fetch + cache + loading/error states (`useQuery`, `invalidateQueries`).
- **shadcn/ui + Tailwind** – ready components (Button, Card, Dialog, Table, Calendar).
- **Context hooks** – `useAuth` (logged-in user), `useTheme` (dark/light + localStorage).

---

## 6. Authentication (JWT + bcrypt)

1. Register/Login → password **bcrypt** se hash hota hai (plain kabhi save nahi).
2. Login sahi → server **JWT token** banata hai (user id + role andar).
3. Frontend token ko localStorage mein rakhta hai.
4. Har request `Authorization: Bearer <token>` header mein bhejti hai.
5. Backend `protect` middleware token verify karta hai. **Stateless** (no session store).

---

## 7. Roles — kaun kya kar sakta hai

- **Patient** – search, book appointment, cancel, review (completed ke baad).
- **Doctor** – stats, availability set, appointment Approve / Reject / Complete.
- **Admin** – stats + charts, doctors approve/delete, users manage, appointments table.

Enforce 2 jagah: frontend `ProtectedRoute` + backend `authorize("ROLE")`
(**asli security backend pe** — frontend bypass ho sakta hai).

---

## 8. ⭐ Double-booking prevention (MOST ASKED)

**2 layers:**

1. **Controller check** – save se pehle same `doctor + date + timeSlot` pe active
   appointment dhoondta hai → mil gayi to clean `409` error.
2. **Database unique index** – `Appointment` pe `(doctorId, date, timeSlot)` ka
   **partial unique index** (sirf active statuses). Race condition mein bhi MongoDB
   khud duplicate reject karta hai. Cancelled appointment slot free kar deti hai.

```ts
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  { unique: true,
    partialFilterExpression: { status: { $in: ["Pending","Confirmed","Completed"] } } }
);
```

---

## 9. Appointment status flow

```
Pending  →  Confirmed  →  Completed
   ↓            ↓
Cancelled   Cancelled
```

- Patient book → **Pending**
- Doctor approve → **Confirmed**, reject → **Cancelled**
- Visit done → **Completed** → phir patient **review** de sakta hai.

---

## 10. Rating calculation

Patient review de → backend us doctor ke saare reviews ka **average** (MongoDB
aggregation `$avg`) nikaal kar `DoctorProfile.rating` + `ratingCount` update karta
hai. Review: sirf **completed appointment** ke baad, ek doctor ko **ek baar**.

---

## 11. Kyun kaunsi tech? (quick reasons)

- **MongoDB** – NoSQL, flexible JSON documents, fast for changing app data.
- **Mongoose** – ODM: schema, validation, relationships (`populate`), hooks.
- **TypeScript** – compile-time type safety (no `any`), bugs jaldi pakadta hai.
- **Zod** – runtime input validation → clean `400` errors.
- **TanStack Query** – server data caching, kam boilerplate.
- **shadcn/ui** – accessible components, code aap ke paas (full control).

---

## 12. How to run

```bash
# Terminal 1 — backend
cd server
npm install
npm run seed      # 8 doctors + admin + patients
npm run dev       # http://localhost:5000

# Terminal 2 — frontend
cd client
npm install
npm run dev       # http://localhost:5173  ← browser
```

**Order:** MongoDB → backend → frontend.

**Demo logins:**
- Admin → `admin@sehatbook.pk` / `admin123`
- Doctor → `ayesha.khan@sehatbook.pk` / `doctor123`
- Patient → `ali@sehatbook.pk` / `patient123`

---

## 13. Demo order (ratne ke liye)

Landing → Find Doctors (search/filter/sort) → Doctor detail → **Patient** login →
Book → My Appointments (cancel) → **Doctor** login → Approve + Complete →
**Patient** review → **Admin** login (charts + manage tables) →
**double-booking error** dikhao.

---

## 14. Quick API reference

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |
| GET | `/api/doctors` | Public |
| GET | `/api/doctors/:id` | Public |
| POST | `/api/appointments` | Patient |
| GET | `/api/appointments` | Auth |
| PUT | `/api/appointments/:id/status` | Doctor/Admin |
| DELETE | `/api/appointments/:id` | Auth |
| POST | `/api/reviews` | Patient |
| GET | `/api/admin/stats` | Admin |

---

## 15. Future improvements (agar poochein)

Online payment (Stripe), email/SMS reminders, real-time notifications (Socket.io),
image upload (Cloudinary), rate limiting, deployment (Vercel + Render + MongoDB Atlas).
