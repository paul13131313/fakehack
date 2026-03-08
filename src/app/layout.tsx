import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fakehack-xi.vercel.app"),
  title: "【本日限定】あなたの人生を変えるチャンス",
  description: "⚠️ CONFIDENTIAL｜本日限定・残り3枠。今すぐ確認してください。",
  openGraph: {
    title: "【本日限定】あなたの人生を変えるチャンス",
    description: "⚠️ CONFIDENTIAL｜本日限定・残り3枠。今すぐ確認してください。",
    images: [{ url: "/ogp.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "【本日限定】あなたの人生を変えるチャンス",
    description: "⚠️ CONFIDENTIAL｜本日限定・残り3枠。今すぐ確認してください。",
    images: ["/ogp.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#000",
          overflow: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
