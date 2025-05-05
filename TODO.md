# Copilot Project Prompt – CDSS Chest X-Ray App (Frontend)

## Overview
Create a fully responsive and modern **Clinical Decision Support System (CDSS)** web app for chest X-ray diagnosis. The project is built using **Next.js (TypeScript)**, styled with **Tailwind CSS**, and structured using **Clean Architecture** and **DRY principles**.

This frontend app interfaces with a Flask-based AI backend (not included here) and provides professional medical imaging support through a polished user experience.

---

## 🔐 Authentication (Static Login)

- Implement a **Login page** and **Register page** with hardcoded user data (when create user put it in the json file no need for BE or Database, also we can deploy app with no errors using vercel).
- Use a simple static list of users with usernames and passwords.
- If login fails, show a validation error.
- After successful login, redirect to `/analyze`.
- Remember session using `localStorage`.
- Add **Logout** button in the navbar.

### UI Notes:
- Login screen should be visually clean, with left/right split layout:
  - Left: Logo + Welcome text + description
  - Right: Login form with floating labels
- Support **dark/light mode toggle** (store in localStorage or Tailwind's dark mode).
- Fully **responsive** for mobile (stacked layout).

---

## 🗂 Pages to Implement

- `/` – Home: Hero section, app description, call to action.
- `/analyze` – Upload X-ray image and analyze via Flask API.
- `/result` – Show prediction result, heatmap, and rule-based decision.
- `/about` – Brief about the purpose of CDSS and this tool.
- `/contact` – Contact or feedback form (static, no backend).

---

## 🧠 Features (Analyze Page + Result Page)

### Image Upload & Prediction
- Drag and drop OR click-to-upload
- Preview uploaded image
- Validate file type (only `.jpg`, `.jpeg`, `.png`)
- Submit image to Flask API: `POST /predict` with image file
- Display loading spinner during analysis

### Result Display
- Display prediction results in cards or charts
- Top-1 predicted disease (e.g., "Pneumonia") with confidence
- Bar chart or badge for top 3 probabilities
- Heatmap overlay (if returned from backend)
  - Toggle: Show/hide heatmap
- Rule-based suggestions under results (static logic in code)
- Optional: Button to download result as PDF

---

## 🧩 Reusable Components to Create

- `ImageUploader.tsx` – Image dropzone + preview
- `PredictionCard.tsx` – Results with confidence levels
- `HeatmapViewer.tsx` – Overlay AI heatmap
- `RuleBasedAdvice.tsx` – Shows medical logic based on thresholds
- `ThemeToggle.tsx` – Light/dark switch
- `Navbar.tsx` – Navigation bar with routing + Logout + Theme toggle
- `Footer.tsx` – Copyright
- `LoginForm.tsx` – Login form logic and validation
- `MobileNav.tsx` – Hamburger for mobile responsiveness
- `ProtectedRoute.tsx` – Check if user is logged in (basic client-side check)

---

## 💡 UI Design Goals

- Responsive (mobile-first)
- Light and dark mode support using Tailwind
- Accessible (alt texts, semantic tags)
- Use Tailwind best practices:
  - `rounded-xl`, `shadow-lg`, `hover:scale-105`, `transition-all`, etc.
- Use `react-icons` or `lucide-react` for visuals
- Use `recharts` or `chart.js` for result charts

---

## 🔁 Static User Example

```ts
// constants/users.ts
export const STATIC_USERS = [
  { username: "doctor1", password: "pass123" },
  { username: "admin", password: "admin123" }
];
````

---

## 🧼 Code Quality Requirements

* Use TypeScript with full types across props, API responses, etc.
* Keep code DRY (Don’t Repeat Yourself)
* Use Clean Architecture: Separate UI, logic, and utilities
* Reusable components for buttons, modals, cards, etc.
* Keep logic in `hooks/` and `features/`, keep components dumb
* Use ESLint + Prettier for code formatting
* Write meaningful commit messages

---

## 🔌 External Packages to Use

* `react-icons` / `lucide-react` – Icons
* `recharts` – Charting (or `chart.js`)
* `classnames` – Conditional class joining
---

## 🧭 Routing & Navigation

* Use Next.js routing
* Add active link highlighting in the navbar
* Add `ProtectedRoute` logic to block access to `/analyze` and `/result` if not logged in

---

## 🚫 No Backend Storage

* No database
* All data is in-memory or stored in browser

---

Copilot: generate a full project based on this description with Next.js, Tailwind CSS, and TypeScript. Start with login + analyze page.

``