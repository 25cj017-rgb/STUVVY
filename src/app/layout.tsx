import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const ostrichSans = localFont({
  src: [
    {
      path: "../../public/fonts/ostrich-sans-black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/ostrich-sans-heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/ostrich-sans-bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/ostrich-sans-bold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/ostrich-sans-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ostrich-sans-bold.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-ostrich",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stuvvy.in'),
  title: "Stuvvy • Authentic South Indian Homely Food Subscription & Delivery (stuvvy.in)",
  description: "Fresh, hygienic, freshly prepared home meals delivered daily across Chennai. Rotating weekly schedules, South Indian thalis, wholesome millets, and monthly subscriptions.",
  keywords: [
    "Stuvvy",
    "stuvvy.in",
    "home food delivery",
    "chennai home meals",
    "homely food subscription",
    "south indian tiffin service",
    "wholesome food chennai"
  ],
  authors: [{ name: "Stuvvy Team" }],
  openGraph: {
    title: "Stuvvy • Sit & Relax. Let Stuvvy Serve You.",
    description: "Wholesome, freshly prepared home-cooked meals delivered daily. Rotating weekly menus with zero repeats.",
    url: "https://stuvvy.in",
    siteName: "Stuvvy",
    images: [
      {
        url: "/stuvvy-logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "Stuvvy Homely Meals"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  icons: {
    icon: "/STUVVY-LOGO.jpeg",
    shortcut: "/STUVVY-LOGO.jpeg",
    apple: "/STUVVY-LOGO.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${outfit.variable} ${ostrichSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-slate-900">{children}</body>
    </html>
  );
}
