import { Geist } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { BASE_URL } from "@/lib/constants";

const siteUrl = BASE_URL || "https://www.proledall.eu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
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
  twitter: {
    card: "summary_large_image",
    title: "ProLEDALL | B2B LED Display Marktplatz Europa",
    description:
      "Europas B2B-Marktplatz für geprüfte LED-Videowände. Anbieter vergleichen, transparente Angebote erhalten und LED-Projekte skalieren.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
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
