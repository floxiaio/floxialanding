import { App } from "./landing/App";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.floxia.io";
const services = [
  "Sistemas para operar",
  "Páginas y aplicaciones",
  "Automatizaciones",
  "Agentes de IA"
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Floxia",
  url: siteUrl,
  logo: `${siteUrl}/brand/floxia-logo-primary.svg`,
  description:
    "Floxia diseña sistemas, automatizaciones y productos digitales alrededor de tu negocio.",
  knowsAbout: [
    "software a medida",
    "desarrollo de aplicaciones web",
    "automatización de procesos",
    "agentes de inteligencia artificial",
    "diseño de productos digitales"
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Floxia",
    itemListElement: services.map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name }
    }))
  }
};

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { caso } = await searchParams;
  const caseId = Array.isArray(caso) ? caso[0] : caso;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <App caseId={caseId ?? ""} />
    </>
  );
}
