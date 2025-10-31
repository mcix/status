import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeltaProto Status",
  description: "Real-time status monitoring for DeltaProto services",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "DeltaProto Status",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "DeltaProto Status",
    description: "Real-time status monitoring for DeltaProto services",
    url: "https://status.deltaproto.com",
    siteName: "DeltaProto Status",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DeltaProto Status",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeltaProto Status",
    description: "Real-time status monitoring for DeltaProto services",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D8242F" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
