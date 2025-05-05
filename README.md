# 🩺 CDSS Chest X-ray App

A Clinical Decision Support System (CDSS) web application that allows users to upload chest X-ray images and receive AI-powered diagnostic suggestions. The project combines a modern frontend (Next.js + Tailwind CSS) with a Python-based backend for medical image processing and ML inference.

---

## 📸 Features

- 🖼️ Upload chest X-ray images.
- 🤖 AI-based decision support using pretrained models.
- 📊 Output diagnostic suggestions with confidence scores.
- 🔁 Rule-based decision fallback if ML fails.
- 🌗 Light & Dark mode toggle.
- 📱 Fully responsive UI (mobile/tablet/desktop).
- 🔒 Simple static login page (for demo purposes).
- ♻️ Clean architecture and reusable components.

---

## 🧱 Tech Stack

### 🧠 AI & Backend
- Python
- Flask
- Torch / TensorFlow (for ML model)
- Pillow, OpenCV, etc.

### 🌐 Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form / Zod
---



---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/MMansy19/cdss-xray-app.git
cd cdss-xray-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the Frontend (Next.js)

```bash
npm run dev
```

### 4. Start the Backend (Python)

```bash
# Example using FastAPI
uvicorn main:app --reload --port 5000
```

Make sure the backend is accessible from the frontend (e.g., via `http://localhost:5000/api/predict`).

---


## 🎨 UI & UX Highlights

* Light/Dark mode switch (tailwind + context)
* Reusable components (`Button`, `ImageCard`, `UploadBox`)
* Smooth transitions and loading skeletons
* Mobile-first responsive layout
---

## 💡 Development Notes

* Clean code practices (DRY, modular, atomic components)
* Separated logic layers (AI, API, UI)
* Code formatted with Prettier + ESLint
---

## 📜 License

This project is for educational and demonstration purposes only. All medical predictions should be reviewed by professionals.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.

---

## 👨‍⚕️ Author

**Mahmoud Mansy**
[GitHub Profile](https://github.com/MMansy19)
