import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";
import DemoModeToggle from "@/components/ui/DemoModeToggle";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "CDSS X-Ray - Clinical Decision Support System",
  description: "AI-powered clinical decision support system for chest X-ray analysis",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo3.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo3.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: {
      url: '/logo3.png',
      sizes: '180x180',
      type: 'image/png',
    },
    shortcut: [
      { url: '/favicon.ico' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo3.png',
      }
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
        {/* Additional favicon links for better cross-browser support */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo3.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo3.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo3.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E40AF" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        {/* Include ThemeToggle component to enforce dark mode on client-side */}
        <AuthProvider>
          <ThemeToggle />
          <DemoModeToggle />
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
