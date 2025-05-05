import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "CDSS X-Ray - Clinical Decision Support System",
  description: "AI-powered clinical decision support system for chest X-ray analysis",
  icons: {
    icon: [
      {
        url: '/logo.png',
        href: '/logo.png',
      },
    ],
    apple: {
      url: '/logo.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
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
      </head>
      <body className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        {/* Include ThemeToggle component to enforce dark mode on client-side */}
        <ThemeToggle />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
