import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SuiClientProviders from "@/components/providers/sui-client-providers";
import NavHeader from "@/components/nav/nav-header";
import { Toaster } from "@/components/ui/sonner";
import { LocationProvider } from "@/components/providers/location-context-provider";
import { BalanceProvider } from "@/components/providers/balance-provider";
import { LocationTrackerSettingsProvider } from "@/components/providers/tracker-settings-provider";
import { BlobPopupProvider } from "@/components/providers/blob-popup-provider";
import { AdminProvider } from "@/components/providers/admin-context-provider";
import { CapturProvider } from "@/components/providers/captur-context-provider";
import { SealSessionProvider } from "@/components/providers/seal-session-provider";

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
        <SealSessionProvider>
          <CapturProvider>
            <BalanceProvider>
              <AdminProvider>
                <LocationProvider>
                  <LocationTrackerSettingsProvider>
                    <body
                      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
                    >
                      <BlobPopupProvider>

                        <div className="min-h-screen flex flex-col px-4">
                          <NavHeader />
                          <main className="flex-1 container mx-auto">
                            {children}
                          </main>
                        </div>
                        <Toaster />
                      </BlobPopupProvider>

                    </body>
                  </LocationTrackerSettingsProvider>
                </LocationProvider>
              </AdminProvider>
            </BalanceProvider>
          </CapturProvider>
        </SealSessionProvider>
      </SuiClientProviders>
    </html >
  );
}
