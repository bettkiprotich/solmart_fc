import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Solmart FC | Official Football Club",
    template: "%s | Solmart FC",
  },
  description: "Official digital home of Solmart FC, Nairobi, Kenya — club news, squad, fixtures, media and merchandise.",
  robots: { index: true, follow: true },
  openGraph: { title: "Solmart FC | Official Football Club", description: "The official digital home of Solmart FC, Nairobi, Kenya.", siteName: "Solmart FC", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased"><a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
