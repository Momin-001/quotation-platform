import { Geist } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { BASE_URL } from "@/lib/constants";

const siteUrl = BASE_URL || "https://www.proledall.eu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProLEDALL | B2B LED Display Marktplatz Europa",
    template: "%s | ProLEDALL",
  },
  description:
    "Europas B2B-Marktplatz für geprüfte LED-Videowände. Anbieter vergleichen, transparente Angebote erhalten und LED-Projekte skalieren.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "ProLEDALL",
    locale: "de_DE",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <NextTopLoader
          color="#2563eb"
          height={3}
          showSpinner={false}
          easing="ease"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
