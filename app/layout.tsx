import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://floxia.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Floxia IA | Aplicaciones web, apps e IA para empresas eficientes",
    template: "%s | Floxia IA"
  },
  description:
    "Floxia IA diseña y desarrolla aplicaciones web, apps para app stores, automatizaciones e inteligencia artificial para elevar la eficiencia operativa de empresas.",
  keywords: [
    "Floxia IA",
    "desarrollo de aplicaciones web",
    "apps empresariales",
    "automatización de procesos",
    "inteligencia artificial para empresas",
    "software a la medida",
    "consultoría IA"
  ],
  openGraph: {
    title: "Floxia IA",
    description:
      "Aplicaciones web, apps y automatización con IA para que los equipos se enfoquen en trabajo de alto valor.",
    url: siteUrl,
    siteName: "Floxia IA",
    images: [
      {
        url: "/logo-negro.jpeg",
        width: 1024,
        height: 1024,
        alt: "Logo de Floxia IA"
      }
    ],
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Floxia IA",
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
