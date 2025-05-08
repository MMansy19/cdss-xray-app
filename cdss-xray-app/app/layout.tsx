import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ServiceWorkerRegistration from "@/components/ui/ServiceWorkerRegistration";
import { AuthProvider } from "@/hooks/useAuth";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1E40AF",
}

export const metadata: Metadata = {
  title: {
    template: '%s | CDSS X-Ray',
    default: 'CDSS X-Ray - Clinical Decision Support System',
  },
  description: "AI-powered clinical decision support system for chest X-ray analysis and diagnostic assistance for medical professionals",
  keywords: ["X-ray analysis", "AI diagnostics", "clinical decision support", "medical imaging", "pneumonia detection", "COVID-19 detection"],
  authors: [{ name: "CDSS Team" }],
  category: "Healthcare",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cdss-xray.example.com/',
    siteName: 'CDSS X-Ray',
    title: 'CDSS X-Ray - Clinical Decision Support System',
    description: 'AI-powered clinical decision support system for chest X-ray analysis',
    images: [
      {
        url: '/logo3.png',
        width: 1200,
        height: 630,
        alt: 'CDSS X-Ray Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CDSS X-Ray - Clinical Decision Support System',
    description: 'AI-powered clinical decision support system for chest X-ray analysis',
    images: ['/logo3.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo3.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Theme initialization script - always set to dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Always set dark mode
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                } catch (err) { }
              })();
            `,
          }}
        />
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Removed duplicate favicon links since they are already defined in metadata */}
        <meta name="theme-color" content="#1E40AF" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        {/* Register service worker for PWA support */}
        <ServiceWorkerRegistration />
        
        {/* Include ThemeToggle component to enforce dark mode on client-side */}
        <AuthProvider>
          <ThemeToggle />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
