import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SuiClientProviders from "@/components/providers/sui-client-providers";
import NavHeader from "@/components/nav/nav-header";
import { Toaster } from "@/components/ui/sonner";
import { LocationProvider } from "@/components/providers/location-context-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Captur",
  description: "This is the captur application submission for the Sui Hackathon.",
  icons: {
    icon: '/captur-icon.avif',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SuiClientProviders>
        <LocationProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
          >
            <div className="min-h-screen flex flex-col px-4">
              <NavHeader />
              <main className="flex-1 container mx-auto">
                {children}
              </main>
              <Toaster />
            </div>
          </body>
        </LocationProvider>
      </SuiClientProviders>
    </html>
  );
}
