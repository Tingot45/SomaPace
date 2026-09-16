import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SomaPace — Smart Learning for Kenyan Students",
    template: "%s · SomaPace",
  },
  description:
    "SomaPace is a smart, self-paced learning platform for Kenyan students in Grades 4-10. Bite-sized lessons, quizzes and flashcards — learn at your own pace, even offline.",
  applicationName: "SomaPace",
  keywords: [
    "Kenya",
    "education",
    "KCPE",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Junior Secondary",
    "learning app",
    "self-paced learning",
  ],
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://somapace.co.ke",
    siteName: "SomaPace",
    title: "Learn at your own pace",
    description: "Smart, self-paced learning for Kenyan students in Grades 4-10.",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  metadataBase: new URL("https://somapace.co.ke"),
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

function AnalyticsScripts() {
  const gtagId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!gtagId) return null;
  return (
    <>
      <Script
        id="analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtagId}', { anonymize_ip: true });
          `,
        }}
      />
      <Script
        id="analytics-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen font-sans antialiased tap-highlight-none">
        <Providers>{children}</Providers>
        <AnalyticsScripts />
        <Toaster />
      </body>
    </html>
  );
}