import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resumint - ATS-Optimized Resume Builder",
  description:
    "AI-powered resume builder that creates ATS-optimized resumes tailored to any job description in seconds.",
  keywords: ["resume builder", "ATS resume", "AI resume", "job application", "resume optimization"],
  openGraph: {
    title: "Resumint - ATS-Optimized Resume Builder",
    description: "Create ATS-optimized resumes with AI in seconds",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!text-[13px]",
              style: {
                background: "#ffffff",
                color: "#0D3B2C",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              },
              success: {
                iconTheme: { primary: "#1E5C40", secondary: "#fff" },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
