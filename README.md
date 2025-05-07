# 🩺 CDSS Chest X-ray Analysis Application

![Next.js](https://img.shields.io/badge/Next.js-15.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.0-blue)

## [Live Demo](https://cdss-xray-app.vercel.app)


A Clinical Decision Support System (CDSS) web application that enables healthcare professionals to upload chest X-ray images and receive AI-powered diagnostic suggestions. This application bridges the gap between modern web technology (Next.js + Tailwind CSS) and advanced medical image processing capabilities, offering a seamless user experience with reliable diagnostic support.

![App Screenshot](frontend/public/logo2.png)

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [UI & UX Highlights](#-ui--ux-highlights)
- [Deployment](#-deployment)
- [Development Notes](#-development-notes)
- [License](#-license)
- [Contributing](#-contributing)
- [Author](#-author)

## 📸 Features

- **🖼️ X-ray Image Upload**: Drag and drop interface for easy chest X-ray upload
- **🤖 AI-powered Analysis**: Advanced machine learning models for accurate diagnostic suggestions
- **🔍 Heatmap Visualization**: Visual highlighting of regions of interest in X-ray images
- **📊 Detailed Results**: Comprehensive diagnostic suggestions with confidence scores
- **🔁 Rule-Based Fallback**: Intelligent fallback mechanisms when ML inference is uncertain
- **🌗 Light & Dark Mode**: Toggle between themes for comfortable viewing in any environment
- **📱 Responsive Design**: Optimized user experience across all device sizes
- **🔒 User Authentication**: Secure login and registration system
- **📊 Interactive Data Visualization**: Display of prediction results using Recharts
- **♻️ Component Architecture**: Clean, modular design with reusable components

## 🧱 Tech Stack

### 🌐 Frontend
- **Next.js 15.3**: React framework with App Router architecture
- **TypeScript**: Type-safe code development
- **React 19**: Component-based UI library
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Dropzone**: For drag-and-drop file uploads
- **Recharts**: For data visualization
- **Lucide React**: Icon library

### 🧠 AI & Backend
- **Python**: Core backend language
- **Flask/FastAPI**: API framework
- **PyTorch/TensorFlow**: ML model implementation
- **Pillow/OpenCV**: Image processing libraries
- **NumPy/Pandas**: Data handling

## 🏗 Architecture

```
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Homepage
│   ├── analyze/          # X-ray upload & analysis
│   ├── result/           # Analysis results display
│   ├── login/            # Authentication
│   └── register/         # New user registration
├── components/           # Reusable React components
│   ├── ui/               # UI components
│   │   ├── ImageUploader.tsx
│   │   ├── HeatmapViewer.tsx
│   │   └── ...
├── hooks/                # Custom React hooks
├── utils/                # Helper functions
│   └── predictionService.ts
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Python 3.8+ (for backend services)

### 1. Clone the Repository

```bash
git clone https://github.com/MMansy19/cdss-xray-app.git
cd cdss-xray-app
```

### 2. Install Frontend Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the Frontend Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 4. Backend Setup (if applicable)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
# or if using FastAPI
uvicorn main:app --reload --port 5000
```

## 🎨 UI & UX Highlights

- **Responsive Design**: Adapts seamlessly to mobile, tablet, and desktop views
- **Theme Switching**: Elegant transition between light and dark modes
- **Intuitive Upload**: Simple drag-and-drop interface with progress indicators
- **Interactive Results**: Dynamic visualization of diagnostic findings
- **Accessibility**: WCAG-compliant design elements
- **Guided User Flow**: Clear navigation path from upload to results

## 🚢 Deployment

### Production Build

```bash
npm run build
# or
yarn build
```

### Deployment Options

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment platform
- **Docker**: Container-based deployment for consistent environments

## 💡 Development Notes

- **Code Organization**: Following Next.js best practices with modular components
- **State Management**: Using React hooks for local state management
- **Type Safety**: Comprehensive TypeScript types for better code reliability
- **Performance Optimization**: Efficient rendering with React best practices
- **API Integration**: Clean separation between frontend and backend services

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

**Important**: This application is designed for educational and demonstration purposes only. All medical predictions should be reviewed by qualified healthcare professionals before clinical use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍⚕️ Author

**Mahmoud Mansy**  
[GitHub Profile](https://github.com/MMansy19)

---

Created with ❤️ for improving chest X-ray diagnostics
