"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MobiletScene, LaSumaScene, ReportsScene, AgentsScene } from "./CaseScenes";
import { cases } from "./cases";
import { useScrollReveal } from "./useScrollReveal";

const scenes = [MobiletScene, LaSumaScene, ReportsScene, AgentsScene];

function CaseLink({ item }) {
  return <Link className="case-link" href={`/?caso=${item.id}`}>{item.real ? "Ver el caso completo" : "Explorar la solución"}<span aria-hidden="true">↗</span></Link>;
}

function Contact() {
  const [notice, setNotice] = useState(false);
  return <section className="contact-section" id="contacto">
    <div className="contact-intro" data-reveal="rise">
      <p className="chapter-kicker">EMPECEMOS POR TU NEGOCIO</p>
      <h2>Tu siguiente sistema empieza con una conversación.</h2>
      <p>Cuéntanos qué proceso quieres mejorar o qué producto quieres lanzar.</p>
      <div className="next-step"><span>¿QUÉ SIGUE?</span><p>Primero entendemos cómo trabajas. Después definimos contigo un primer alcance y los siguientes pasos.</p></div>
    </div>
    <form className="contact-form" data-reveal="rise" onSubmit={(event) => { event.preventDefault(); setNotice(true); }}>
      <label htmlFor="name">Nombre</label><input id="name" name="name" autoComplete="name" required />
      <label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="need">¿Qué quieres mejorar o construir?</label><textarea id="need" name="need" rows="3" placeholder="Cuéntanos brevemente tu necesidad." required />
      <button className="button button--primary" type="submit">Hablemos de tu proyecto <span aria-hidden="true">↗</span></button>
      <p className="preview-note" role={notice ? "status" : undefined}>{notice ? "Esta vista previa no envía mensajes ni guarda tus datos." : "Formulario de muestra · El envío aún no está conectado."}</p>
    </form>
  </section>;
}

function Footer() {
  return <footer className="site-footer"><Link href="/" aria-label="Floxia, inicio"><img src="/brand/floxia-logo-primary.svg" alt="Floxia" /></Link><span>Producto, diseño y tecnología.</span><Link href="#contacto">Hablemos ↗</Link></footer>;
}

function CasePage({ item }) {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);
  const Scene = scenes[cases.indexOf(item)];
  return <main className="case-page" ref={pageRef}>
    <header className="case-page-header"><Link href="/"><img src="/brand/floxia-logo-primary.svg" alt="Floxia, inicio" /></Link><Link href={`/#${item.id}`}>← Volver a los casos</Link><Link href="#contacto">Hablemos ↗</Link></header>
    <section className="case-page-intro" data-reveal="rise"><p className="chapter-kicker">{item.number} / {item.category}</p><p className="case-kind">{item.real ? "PROYECTO REAL" : "EJEMPLO ILUSTRATIVO · BASADO EN CAPACIDADES DESARROLLADAS"}</p><h1>{item.name}.<br />{item.title}</h1><p>{item.introduction}</p><ul className="scope-list">{item.scope.map(scope => <li key={scope}>{scope}</li>)}</ul></section>
    <div className="case-page-scene" data-reveal="scene"><Scene /></div>
    <section className="case-page-story" data-reveal="rise"><p className="chapter-kicker">EL RETO</p><h2>{item.challenge}</h2><div className="detail-steps">{item.detailSteps.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><p className="evidence-note">{item.note}</p></section>
    <Contact /><Footer />
  </main>;
}

function HomePage() {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);
  const heroRef = useRef(null);
  const notchRef = useRef(null);
  const menuPinned = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      hero.style.setProperty("--field-x", `${currentX.toFixed(2)}px`);
      hero.style.setProperty("--field-y", `${currentY.toFixed(2)}px`);
      hero.style.setProperty("--field-x-reverse", `${(-currentX * 0.72).toFixed(2)}px`);
      hero.style.setProperty("--field-y-reverse", `${(-currentY * 0.72).toFixed(2)}px`);
      frame = window.requestAnimationFrame(render);
    };

    const handlePointer = (event) => {
      const bounds = hero.getBoundingClientRect();
      const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
      targetX = normalizedX * -42;
      targetY = normalizedY * -30;
    };

    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
    };

    hero.addEventListener("pointermove", handlePointer);
    hero.addEventListener("pointerleave", resetPointer);
    frame = window.requestAnimationFrame(render);

    return () => {
      hero.removeEventListener("pointermove", handlePointer);
      hero.removeEventListener("pointerleave", resetPointer);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!notchRef.current?.contains(event.target)) { menuPinned.current = false; setMenuOpen(false); }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") { menuPinned.current = false; setMenuOpen(false); }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <main ref={pageRef}>
      <section className={`hero${menuOpen ? " menu-open" : ""}`} id="inicio" ref={heroRef}>
        <div className="system-field" aria-hidden="true">
          <div className="field-motion field-motion--base">
            <img src="/assets/floxia-star-field-v2.png" alt="" />
          </div>
          <div className="field-motion field-motion--echo">
            <img src="/assets/floxia-star-field-v2.png" alt="" />
          </div>
          <div className="field-motion field-motion--spark">
            <img src="/assets/floxia-star-field-v2.png" alt="" />
          </div>
        </div>

        <nav
          className={`notch-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Navegación rápida"
          ref={notchRef}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => { if (!menuPinned.current) setMenuOpen(false); }}
          onFocusCapture={() => setMenuOpen(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) { menuPinned.current = false; setMenuOpen(false); }
          }}
        >
          <div className="notch-inner">
            <Link href="#inicio" tabIndex={menuOpen ? 0 : -1} onClick={() => { menuPinned.current = false; setMenuOpen(false); }}>
              Inicio
            </Link>
            <Link href="#que-hacemos" tabIndex={menuOpen ? 0 : -1} onClick={() => { menuPinned.current = false; setMenuOpen(false); }}>
              Qué hacemos
            </Link>
            <button
              className="notch-trigger"
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => { menuPinned.current = !menuPinned.current; setMenuOpen(menuPinned.current); }}
            >
              <img src="/brand/floxia-favicon.svg" alt="" />
            </button>
            <Link href="#proyectos" tabIndex={menuOpen ? 0 : -1} onClick={() => { menuPinned.current = false; setMenuOpen(false); }}>
              Proyectos
            </Link>
            <Link href="#como-trabajamos" tabIndex={menuOpen ? 0 : -1} onClick={() => { menuPinned.current = false; setMenuOpen(false); }}>
              Proceso
            </Link>
          </div>
        </nav>

        <header className="site-header">
          <Link className="brand" href="#inicio" aria-label="Floxia, inicio">
            <img src="/brand/floxia-logo-inverse.svg" alt="Floxia" />
          </Link>

          <Link className="header-cta" href="#contacto">Hablemos</Link>
        </header>

        <div className="hero-content">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Presencia. Automatización. Control.
          </p>
          <h1>Hacemos que la tecnología trabaje para tu negocio.</h1>
          <p className="hero-copy">
            Diseñamos sistemas, automatizaciones y productos digitales
            alrededor de tu negocio.
          </p>

          <div className="hero-actions">
            <Link className="button button--primary" href="#contacto">Cuéntanos tu proyecto <span aria-hidden="true">↗</span></Link>
            <Link className="button button--secondary" href="#proyectos">
              Ver nuestro trabajo
            </Link>
          </div>
        </div>

        <Link className="scroll-cue" href="#que-hacemos">
          Explorar
        </Link>
      </section>

      <section className="work-intro" id="que-hacemos">
        <div className="work-intro-top"><p className="chapter-kicker">QUÉ PODEMOS HACER POR TI</p><span className="intro-side">Elige una solución.<br />Explora su proyecto o ejemplo.</span></div>
        <h2 data-reveal="rise">La solución toma la forma<br className="desktop-break" /> que tu negocio necesita.</h2>
        <div className="capability-index" data-reveal="rise">{cases.map(item => <Link href={`#${item.id}`} key={item.id}><span>{item.number}</span><strong>{item.category}</strong><span aria-hidden="true">↘</span></Link>)}</div>
        <div className="proof-intro"><div><h3>Así se ve en la práctica.</h3><p>Dos proyectos reales y dos ejemplos de aplicación.</p></div><Link href="#proyectos">RECORRE LOS EJEMPLOS <span aria-hidden="true">↓</span></Link></div>
      </section>
      <div className="work-chapters" id="proyectos">{cases.map((item, index) => {
        const Scene = scenes[index];
        return <section className={`case-chapter case-chapter--${item.id}${index % 2 === 0 ? " case-chapter--dark" : ""}`} id={item.id} key={item.id}>
          <div className="chapter-top"><p className="chapter-kicker"><span>{item.number}</span> / {item.category}</p><p className="case-kind">{item.real ? "PROYECTO REAL" : "EJEMPLO ILUSTRATIVO"}</p></div>
          <div className="chapter-grid"><div className="chapter-copy" data-reveal="rise"><p className="project-name">{item.name}</p><h2>{item.title}</h2><div className="contribution"><span>{item.real ? "LO QUE CONSTRUIMOS" : "LA SOLUCIÓN"}</span><p>{item.built}</p></div><div className="contribution"><span>QUÉ PERMITE</span><p>{item.outcome}</p></div>{!item.real && <p className="illustrative-note">Basado en capacidades desarrolladas.</p>}<CaseLink item={item} /></div><div className="chapter-media" data-reveal="scene"><Scene /></div></div>
          <div className="chapter-bottom"><span>{item.steps.map((step, stepIndex) => <span key={step}>{stepIndex > 0 && <i aria-hidden="true">→</i>}{step}</span>)}</span><span>{item.number} / 04</span></div>
        </section>;
      })}</div>
      <section className="audience-section">
        <div className="section-heading" data-reveal="rise"><p>A QUIÉN AYUDAMOS</p><h2>Cuando tu negocio necesita una solución propia.</h2></div>
        <div className="audience-list">
          <article data-reveal="step" data-reveal-order="0"><span>01</span><div><p>Servicios y distribución</p><h3>Información repartida.</h3></div><p>Conectamos pedidos, trabajo en campo y cobros.</p></article>
          <article data-reveal="step" data-reveal-order="1"><span>02</span><div><p>Marcas, medios y comunidades</p><h3>Un producto con reglas propias.</h3></div><p>Diseñamos y construimos tu página, plataforma o aplicación.</p></article>
          <article data-reveal="step" data-reveal-order="2"><span>03</span><div><p>Administración, compras y operación</p><h3>Tareas que se repiten.</h3></div><p>Integramos herramientas y automatizamos el trabajo con IA cuando aporta valor.</p></article>
        </div>
      </section>
      <section className="process-section" id="como-trabajamos">
        <p className="chapter-kicker">CÓMO TRABAJAMOS</p><h2 data-reveal="rise">De entender tu negocio<br />a ponerlo en marcha.</h2>
        <div className="process-steps">{[["Entender", "Alcance claro"], ["Diseñar", "Prototipos visibles"], ["Construir", "Pruebas del flujo"], ["Acompañar", "Guías y soporte"]].map(([title, detail], index) => <article key={title} data-reveal="step" data-reveal-order={index}><span>0{index+1}</span><h3>{title}.</h3><p>{detail}</p></article>)}</div>
      </section>
      <Contact />
      <Footer />
    </main>
  );
}

// Separate page components ensure homepage effects stop on case navigation.
export function App({ caseId = "" }) {
  const selectedCase = cases.find((item) => item.id === caseId);
  return selectedCase ? <CasePage key={selectedCase.id} item={selectedCase} /> : <HomePage />;
}
