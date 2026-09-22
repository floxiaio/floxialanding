import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://floxia.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: "/brand/floxia-favicon.svg" },
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
        url: "/logo-negro.jpeg",
        width: 1024,
        height: 1024,
        alt: "Logo de Floxia"
      }
    ],
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Floxia",
    description:
      "IA, automatización y desarrollo de productos digitales para empresas."
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
