import Image from "next/image";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  CircuitBoard,
  Gauge,
  MoveRight,
  Orbit,
  Play,
  Radar,
  Sparkles,
  Workflow,
  Zap
} from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://floxia.ai";

const services = [
  "Aplicaciones web y plataformas internas",
  "Apps móviles para operación, clientes o equipos",
  "Automatización de procesos repetitivos",
  "Agentes y copilotos de IA con contexto de negocio"
];

const momentum = [
  "Menos operación manual",
  "Mejores decisiones con IA",
  "Software adoptado por el equipo",
  "Procesos listos para crecer"
];

const sections = [
  {
    id: "pensar",
    icon: BrainCircuit,
    title: "Pensar con criterio",
    eyebrow: "01 / Estrategia IA",
    text: "Antes de construir, identificamos dónde la inteligencia artificial realmente puede mejorar velocidad, calidad o trazabilidad. No agregamos tecnología por tendencia: la usamos donde cambia el resultado."
  },
  {
    id: "construir",
    icon: Workflow,
    title: "Construir con precisión",
    eyebrow: "02 / Producto digital",
    text: "Diseñamos aplicaciones web, apps móviles y flujos automatizados que conectan datos, personas y decisiones. La experiencia se mantiene simple, aunque el proceso detrás sea complejo."
  },
  {
    id: "escalar",
    icon: Zap,
    title: "Escalar sin fricción",
    eyebrow: "03 / Operación eficiente",
    text: "Convertimos pilotos en sistemas adoptados: medibles, integrados y listos para evolucionar con el negocio. La meta no es lanzar software; es cambiar cómo avanza la operación."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Floxia IA",
  url: siteUrl,
  logo: `${siteUrl}/logo-negro.jpeg`,
  description:
    "Floxia IA diseña aplicaciones web, apps móviles, automatizaciones e inteligencia artificial para empresas que quieren operar con mayor eficiencia.",
  knowsAbout: [
    "diseño de aplicaciones",
    "desarrollo de aplicaciones web",
    "automatización de procesos",
    "inteligencia artificial para empresas",
    "software empresarial"
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Floxia IA",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service
      }
    }))
  }
};

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#071e2a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Hero />
      <MomentumBar />
      <PrecisionSection />
      <FinalCta />
    </main>
  );
}

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <a href="#inicio" className="focus-ring flex items-center gap-3 rounded-full">
        <Image
          src="/logo-negro.jpeg"
          alt="Floxia IA"
          width={44}
          height={44}
          className="h-11 w-11 rounded-full bg-white object-contain"
          priority
        />
        <span className="text-sm font-semibold uppercase">Floxia IA</span>
      </a>
      <nav className="hidden items-center gap-7 text-sm font-medium text-white/70 md:flex">
        <a className="focus-ring rounded-full hover:text-white" href="#pensar">
          Pensar
        </a>
        <a className="focus-ring rounded-full hover:text-white" href="#construir">
          Construir
        </a>
        <a className="focus-ring rounded-full hover:text-white" href="#escalar">
          Escalar
        </a>
      </nav>
      <a
        href="mailto:hola@floxia.ai"
        className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink transition hover:bg-lime"
      >
        Hablemos
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="hero-field relative overflow-hidden">
      <Header />
      <div className="mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/76 backdrop-blur">
            <Sparkles className="h-4 w-4 text-lime" aria-hidden="true" />
            IA, automatización y producto digital
          </p>
          <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            La forma más simple de convertir operación en avance.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            Floxia IA crea aplicaciones y automatizaciones inteligentes para empresas que quieren trabajar mejor, moverse más rápido y liberar a su equipo de lo repetitivo.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#pensar"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-ink transition hover:bg-white"
            >
              Ver enfoque
              <MoveRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="mailto:hola@floxia.ai"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Iniciar conversación
              <Play className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="relative z-10 min-h-[520px]">
          <div className="flow-orbit">
            <div className="orbit-ring orbit-ring-one" />
            <div className="orbit-ring orbit-ring-two" />
            <div className="center-core">
              <Image
                src="/logo-blanco.jpeg"
                alt="Logo blanco de Floxia IA"
                width={132}
                height={132}
                className="h-24 w-24 rounded-full object-contain"
              />
            </div>
            <FloatingNode className="left-[4%] top-[16%]" icon={Radar} title="Diagnóstico" text="Fricciones reales" />
            <FloatingNode className="right-[3%] top-[28%]" icon={Bot} title="IA útil" text="Decisión y acción" />
            <FloatingNode className="bottom-[18%] left-[12%]" icon={CircuitBoard} title="Software" text="Producto operativo" />
            <FloatingNode className="bottom-[8%] right-[10%]" icon={Gauge} title="Impacto" text="Eficiencia medible" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingNode({
  className,
  icon: Icon,
  title,
  text
}: {
  className: string;
  icon: typeof Radar;
  title: string;
  text: string;
}) {
  return (
    <div className={`floating-node absolute ${className}`}>
      <Icon className="h-5 w-5 text-lime" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-white/58">{text}</p>
      </div>
    </div>
  );
}

function MomentumBar() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03] px-5 py-5 backdrop-blur sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
        {momentum.map((item) => (
          <div
            key={item}
            className="flex min-h-20 items-center justify-between rounded-full border border-white/10 px-5 py-4 text-sm font-semibold text-white/78"
          >
            <span>{item}</span>
            <ArrowRight className="h-4 w-4 text-lime" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PrecisionSection() {
  return (
    <section id="pensar" className="relative overflow-hidden border-b border-white/10 py-20">
      <div className="proposal-glow proposal-glow-lime" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-semibold uppercase text-lime">Precisión ambiciosa</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Modernizar no es hacer más. Es hacer que todo fluya mejor.
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-white/68">
            Nuestro enfoque une estrategia, diseño y tecnología para crear sistemas claros: fáciles de usar, difíciles de romper y pensados para generar avance real.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/50">
            <span className="h-px w-12 bg-lime" />
            <span>De una fricción puntual a una operación más inteligente</span>
          </div>
        </aside>

        <div className="grid gap-4">
          {sections.map((section, index) => (
            <article
              id={section.id === "pensar" ? undefined : section.id}
              key={section.title}
              className="flow-panel group grid min-h-[210px] gap-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:border-lime/70 hover:bg-white/[0.09] md:grid-cols-[0.24fr_1fr_0.2fr]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime text-sm font-bold text-ink">
                  0{index + 1}
                </span>
                <section.icon className="mt-3 h-6 w-6 text-lime" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-white/38">{section.eyebrow}</p>
                <h3 className="mt-3 text-3xl font-semibold leading-tight">{section.title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/66">{section.text}</p>
              </div>
              <div className="hidden items-center justify-end md:flex">
                <Orbit className="h-9 w-9 text-white/18 transition group-hover:rotate-45 group-hover:text-lime" aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="criterio" className="bg-white px-5 py-20 text-ink sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-signal">Siguiente paso</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight">
            Empezar pequeño, demostrar valor y escalar lo que funciona.
          </h2>
        </div>
        <div className="grid gap-4">
          {[
            "Elegimos un proceso con fricción visible.",
            "Diseñamos un piloto simple con IA, automatización o software a la medida.",
            "Medimos impacto, adopción y el siguiente nivel de evolución."
          ].map((item) => (
            <div key={item} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-cloud p-5">
              <Check className="mt-1 h-5 w-5 text-signal" aria-hidden="true" />
              <p className="text-base leading-7 text-slate-700">{item}</p>
            </div>
          ))}
          <a
            href="mailto:floxiaai@gmail.com"
            className="focus-ring mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Hablemos de un primer piloto
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
