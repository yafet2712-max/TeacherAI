# Meskerem school ai (የመስከረም ትምህርት ቤት የAI ረዳት)

An AI-powered, trilingual (**Amharic / አማርኛ**, **Afaan Oromoo**, and **English**) full-stack educational productivity and school-management platform tailored for Ethiopian pre-primary, primary, and medium school teachers (e.g., **Meskerem pre-primary , primary and medium school**) and aligned with the **Ethiopian Ministry of Education (MoE)** curriculum standards.

**Author & Copyright Owner:** Zenaneh Tsegaye (ዜናነህ ፀጋዬ) • Contact: [@zenayafet](https://t.me/zenayafet)

---

## 🌟 Core Innovations & Features

### 1. Trilingual Curriculum & Lesson Planning Engine
- **1-Day Daily Lesson Plan (ዕለታዊ የትምህርት እቅድ)**: Exact official 9-column MoE matrix (*Stages, Time, Learning Contents, Page, Teacher's Activities, Student's Activities, Assessment, Teaching Aids, Remarks*), plus rationale, prerequisite knowledge, competencies, special needs differentiation (*Slow / Medium / Fast Learners*), and official signature blocks (*Teacher, Department Head, Vice Principal*).
- **5-Days Weekly Lesson Plan (የ5 ቀናት ሳምንታዊ እቅድ)**: Monday–Friday sequential weekly planner where each day renders in the 100% official daily format. Includes 1 free trial, followed by Telebirr subscription.
- **Native Microsoft Word (`.docx`) Export**: One-click export producing print-ready, page-broken `.docx` documents matching the on-screen MoE layout.

### 2. Mark List (Continuous Assessment Grading Sheet) & 6 School Formats
- **1. Mark List / Continuous Assessment Grading Sheet**: Multi-row header table (*September 20%, October 25%, November 25%, Final Exam 20%, Total 100%, Rank*) with live auto-calculation of monthly subtotals, final totals, and class rankings. Supports CSV upload and merged-header **Excel (`.xls`)** export.
- **2. CPD Format**: Teacher Continuing Professional Development plan & evaluation sheet.
- **3. MLC Level Students**: Minimum Learning Competency tracking register.
- **4. Tutorial Formats**: Remedial tutorial planning & progress tracker.
- **5. Communication Sheet**: Parent-teacher and school administration log.
- **6. Attendance Sheet**: Student weekly/monthly attendance tracker.

### 3. Additional AI Classroom & Language Tools
- **Quick 1-Word Quiz Generator (`⚡ 1-ቃል ፈተና`)** & **Worksheet Maker**
- **Interactive Ethiopic Fidel Chart** & **On-Screen Virtual Fidel Keyboard** with **Audio TTS Pronunciation**
- **Grammar Lab**, **Cultural Translator**, **Stories & Fables Generator**, **Assignment & Essay Grader**, and **AI Mentor Chat**
- **Saved School Library** (persisted locally) & **Progressive Web App (PWA)** offline support

### 4. Telebirr Subscription & Owner Admin Approval System
- **Telebirr Payment Flow (`+251956263882`)**: Users submit their phone number and Telebirr Transaction ID to receive a unique Reference Code (`REF-xxxxxx`), then send payment confirmation to `@zenayafet`.
- **Owner Admin Dashboard (`👑 Admin Login`)**: Protected administrator portal to review pending requests, approve (`30-day` access window) or reject requests, and automatically notify users when a 30-day subscription expires.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, `docx`, `vite-plugin-pwa`
- **Backend:** Node.js, Express, `tsx`, `@google/genai` (Gemini API)
- **Build & CI:** Vite 8, TypeScript (`tsc --noEmit`), GitHub Actions CI & CodeQL

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v20+** (or v22)
- A Google Gemini API Key (`GEMINI_API_KEY`)

### Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set `GEMINI_API_KEY="your_api_key_here"` inside `.env`.
3. Run development server:
   ```bash
   npm run dev
   ```
4. Type-check and build for production:
   ```bash
   npm run lint
   npm run build
   npm start
   ```

---

## 📦 Pushing to GitHub

```bash
git init
git add .
git commit -m "feat: Ethiopian MoE Teacher Helper AI - full release"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

In your GitHub repository **Settings → Secrets and variables → Actions**, no secrets are required for CI build checks (`npm run lint && npm run build`). For live hosting (Render, Railway, Vercel, Cloud Run), add `GEMINI_API_KEY` as an environment variable.
