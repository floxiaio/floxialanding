import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.floxia.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/brand/floxia-favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
      { url: "/brand/floxia-icon-32-v2.png", type: "image/png", sizes: "32x32" }
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", type: "image/png", sizes: "180x180" }]
  },
  manifest: "/site.webmanifest",
  title: {
    default: "Floxia — Tecnología para tu negocio",
    template: "%s | Floxia"
  },
  description:
    "Diseñamos sistemas, automatizaciones y productos digitales alrededor de tu negocio. Más presencia digital, menos trabajo repetitivo y mayor control.",
  keywords: [
    "Floxia",
    "desarrollo de aplicaciones web",
    "apps empresariales",
    "automatización de procesos",
    "inteligencia artificial para empresas",
    "software a la medida",
    "consultoría IA"
  ],
  openGraph: {
    title: "Floxia",
    description:
      "Aplicaciones web, apps y automatización con IA para que los equipos se enfoquen en trabajo de alto valor.",
    url: siteUrl,
    siteName: "Floxia",
    images: [
      {
        url: "/brand/floxia-share-square-v2.png",
        width: 1024,
        height: 1024,
        type: "image/png",
        alt: "Identidad oficial de Floxia sobre fondo grafito"
      }
    ],
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Floxia",
    description:
      "IA, automatización y desarrollo de productos digitales para empresas.",
    images: [
      {
        url: "/brand/floxia-share-wide-v2.png",
        width: 1200,
        height: 630,
        alt: "Floxia — Tecnología para tu negocio"
      }
    ]
  },
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body>
        {children}
      </body>
    </html>
  );
}
