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
  title: "ResumeAI - ATS-Optimized Resume Builder",
  description:
    "AI-powered resume builder that creates ATS-optimized resumes tailored to any job description in seconds.",
  keywords: ["resume builder", "ATS resume", "AI resume", "job application", "resume optimization"],
  openGraph: {
    title: "ResumeAI - ATS-Optimized Resume Builder",
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
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!text-[13px]",
              style: {
                background: "var(--toast-bg, #18181b)",
                color: "var(--toast-fg, #fff)",
                border: "1px solid var(--toast-border, rgba(255,255,255,0.1))",
                fontSize: "13px",
              },
              success: {
                iconTheme: { primary: "#6366f1", secondary: "#fff" },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
