import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LivingLink  Living Kidney Donor Platform",
    template: "%s | LivingLink",
  },
  description:
    "LivingLink empowers living kidney donors with tools, mentorship, financial support, and long-term follow-up care  every step of the donation journey.",
  keywords: ["kidney donation", "living donor", "kidney transplant", "donor support"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          {/* Section 508: Skip navigation */}
          <a href="#main-content" className="skip-nav">
            Skip to main content
          </a>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
