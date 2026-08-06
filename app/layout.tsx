import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Bebas_Neue,
  Barlow_Condensed,
  Big_Shoulders,
  Oswald,
} from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const BASE_URL = "https://benni.com.br";
const DESCRIPTION = "Designer and developer building fast, intentional websites — from concept to live, without handoff. Based in Brazil, working in PT, DE and EN.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Benjamin Vichel — Web Designer & Developer",
    template: "%s | Benjamin Vichel",
  },
  description: DESCRIPTION,
  keywords: ["web designer", "web developer", "freelance", "Next.js", "React", "portfolio", "Brazil", "Benjamin Vichel"],
  authors: [{ name: "Benjamin Vichel", url: BASE_URL }],
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Benjamin Vichel",
    title: "Benjamin Vichel — Web Designer & Developer",
    description: DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Benjamin Vichel — Web Designer & Developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Benjamin Vichel — Web Designer & Developer",
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${geistSans.variable} ${geistMono.variable}
        ${bebasNeue.variable} ${barlowCondensed.variable}
        ${bigShoulders.variable} ${oswald.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-full flex flex-col">
        <PageTransition />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
