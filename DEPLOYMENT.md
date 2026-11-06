# 🚀 SehatBook — Deploy to Vercel + MongoDB Atlas

Frontend aur backend **dono Vercel** pe jayenge (2 alag Vercel projects, ek hi repo se),
aur database **MongoDB Atlas** (free cloud) pe. Ye guide step-by-step hai.

> **Note:** Ye deploy aap ko apne account se karna hai (Vercel/Atlas login aap ka hota hai).
> Code already **deploy-ready** hai — bas neeche ke steps follow karo.

---

## 📋 Pehle ye accounts bana lo (sab free)

1. **GitHub** — https://github.com (code yahan push hoga)
2. **MongoDB Atlas** — https://www.mongodb.com/cloud/atlas/register
3. **Vercel** — https://vercel.com/signup (GitHub se sign up karo — asaan rahega)

---

## 1️⃣ MongoDB Atlas setup (cloud database)

1. Atlas pe login → **Create** → **Cluster** → **M0 (Free)** choose karo → Create.
2. **Database Access** → **Add New Database User** →
   - Username: `sehatbook` · Password: (koi strong password, note kar lo)
   - Role: **Read and write to any database** → Add User.
3. **Network Access** → **Add IP Address** → **Allow Access From Anywhere**
   (`0.0.0.0/0`) → Confirm. *(Vercel ke servers kisi bhi IP se aate hain, isliye zaroori.)*
4. **Database** → **Connect** → **Drivers** → connection string copy karo. Aisa dikhega:
   ```
   mongodb+srv://sehatbook:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. `<password>` ki jagah apna asal password likho, aur `.net/` ke baad database ka naam
   `sehatbook` add karo:
   ```
   mongodb+srv://sehatbook:YOURPASS@cluster0.xxxxx.mongodb.net/sehatbook?retryWrites=true&w=majority
   ```
   **Ye poori string sambhaal ke rakho — isko MONGO_URI kehte hain.**

---

## 2️⃣ Database mein dummy data daalo (seed) — ek baar

Apne computer pe, `server/.env` mein `MONGO_URI` ko Atlas wali string se set karo, phir:

```bash
cd server
npm install
npm run seed
```

Isse Atlas pe 8 doctors + admin + patients ban jayenge. (Baad mein chaho to
`server/.env` wapas localhost pe set kar sakte ho local dev ke liye.)

---

## 3️⃣ Code GitHub pe push karo

Project root (`finalProject_backend-frontend/`) mein:

```bash
git init
git add .
git commit -m "SehatBook full-stack app"
# GitHub pe ek naya empty repo banao, phir:
git remote add origin https://github.com/<your-username>/sehatbook.git
git branch -M main
git push -u origin main
```

> `.env` files `.gitignore` mein hain — ye GitHub pe **nahi** jayengi (sahi hai, secrets safe).

---

## 4️⃣ Backend deploy karo (Vercel Project #1)

1. Vercel dashboard → **Add New** → **Project** → apna GitHub repo **Import** karo.
2. **Root Directory** → **Edit** → `server` select karo. ⚠️ *(Bahut important — backend `server/` folder hai.)*
3. Framework Preset: **Other** (automatic detect ho jayega).
4. **Environment Variables** add karo:

   | Name | Value |
   |------|-------|
   | `MONGO_URI` | aap ki Atlas connection string (step 1) |
   | `JWT_SECRET` | koi lamba random secret, e.g. `kjf83hdsk...9f` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | abhi khali chhod do / `*` — step 6 mein update karenge |

5. **Deploy** dabao. Ho jane pe URL milega, e.g. `https://sehatbook-api.vercel.app`.
6. **Test:** browser mein `https://sehatbook-api.vercel.app/api/health` kholo →
   `{"success":true,...}` aana chahiye. ✅

   **Ye backend URL note kar lo.**

---

## 5️⃣ Frontend deploy karo (Vercel Project #2)

1. Vercel → **Add New** → **Project** → **wahi repo dobara** Import karo.
2. **Root Directory** → **Edit** → `client` select karo. ⚠️
3. Framework Preset: **Vite** (auto-detect).
4. **Environment Variable** add karo:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://sehatbook-api.vercel.app/api` (step 4 ka backend URL **+ `/api`**) |

5. **Deploy** dabao. URL milega, e.g. `https://sehatbook.vercel.app`.

   **Ye frontend URL note kar lo.**

---

## 6️⃣ Backend ko frontend URL batao (CORS) — zaroori

Ab backend ko pata hona chahiye ke requests kis frontend se aa rahi hain:

1. Vercel → **backend project** (#1) → **Settings** → **Environment Variables**.
2. `CLIENT_URL` ko edit/add karo → value = aap ka frontend URL:
   ```
   https://sehatbook.vercel.app
   ```
   *(Local bhi allow karna ho to comma se: `https://sehatbook.vercel.app,http://localhost:5173`)*
3. Backend project → **Deployments** → latest → **Redeploy** (taake naya env apply ho).

---

## ✅ Verify (sab chal raha hai?)

1. Frontend URL kholo: `https://sehatbook.vercel.app`
2. Login karo: `ali@sehatbook.pk` / `patient123`
3. Doctors list aani chahiye, booking chalni chahiye.
4. Agar login pe error aaye → neeche **Troubleshooting** dekho.

**Demo logins** (seed ke baad): admin@sehatbook.pk/admin123 ·
ayesha.khan@sehatbook.pk/doctor123 · ali@sehatbook.pk/patient123

---

## ⚡ Alternative: Vercel CLI se (GitHub ke bina)

```bash
npm i -g vercel

# backend
cd server && vercel         # login + follow prompts; env vars dashboard se add karo
cd server && vercel --prod

# frontend
cd client && vercel
cd client && vercel --prod
```

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| Login/data load nahi hota, console mein **CORS error** | Backend ka `CLIENT_URL` = exact frontend URL (no trailing `/`). Redeploy karo. |
| `500` ya "MongoServerError" | `MONGO_URI` galat hai, ya Atlas **Network Access** mein `0.0.0.0/0` allow nahi. |
| Frontend pe doctors khali | DB seed nahi hua. Step 2 dobara (Atlas URI ke saath). |
| Page refresh pe **404** | `client/vercel.json` ka SPA rewrite present hona chahiye (already hai). |
| API `/api/health` 404 | Backend ka **Root Directory** `server` set hai? `server/vercel.json` present? |
| Frontend purana API use kar raha | `VITE_API_URL` change ke baad frontend ko **redeploy** karo (build-time var hai). |

---

## 🧠 Viva ke liye (deployment samajh)

- **Frontend** ek static build (HTML/CSS/JS) hai → Vercel CDN pe serve hota hai.
- **Backend** Vercel pe **serverless function** ke roop mein chalta hai (`server/api/index.ts`),
  aur `vercel.json` har request ko Express app pe bhejta hai.
- **MongoDB connection** cache hoti hai (`connectDB`) taake har serverless invocation pe
  dobara connect na ho.
- Frontend aur backend **alag domains** pe hain, isliye **CORS** configure karna zaroori tha.
- Secrets (`MONGO_URI`, `JWT_SECRET`) code mein nahi — Vercel **Environment Variables** mein hain.
