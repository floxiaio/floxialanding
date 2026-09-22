import { useId, useState } from 'react'

function SceneFrame({ className = '', label, meta, children, footnote }) {
  return (
    <div className={`case-scene ${className}`}>
      <div className="scene-bar">
        <span className="scene-bar-label">{label}</span>
        <span className="scene-bar-meta">{meta}</span>
      </div>
      {children}
      {footnote && <p className="scene-footnote">{footnote}</p>}
    </div>
  )
}

const mobiletSteps = [
  {
    title: 'Pedido',
    heading: 'Todo empieza en el pedido.',
    description: 'Equipo, ubicación y servicio comparten el mismo contexto.',
    fields: [['Equipo', 'Unidad de demostración'], ['Ubicación', 'Punto de servicio'], ['Servicio', 'Vinculado al pedido']],
    next: 'Continuar al servicio',
  },
  {
    title: 'Servicio',
    heading: 'El trabajo conserva su contexto.',
    description: 'Las actividades y responsables se consultan desde la operación.',
    fields: [['Pedido de origen', 'PED-DEMO-01'], ['Actividad', 'Servicio en campo'], ['Seguimiento', 'Registro del servicio']],
    next: 'Consultar el cobro',
  },
  {
    title: 'Cobro',
    heading: 'Una misma historia, hasta el cobro.',
    description: 'El registro de cobro mantiene su relación con el pedido y el servicio.',
    fields: [['Pedido relacionado', 'PED-DEMO-01'], ['Servicio', 'Consultar registro'], ['Cobranza', 'Seguimiento del pedido']],
    next: 'Volver al pedido',
  },
]

export function MobiletScene() {
  const [step, setStep] = useState(0)
  const sceneId = useId()
  const current = mobiletSteps[step]

  return (
    <SceneFrame className="mobilet-scene" label="Mobilet / Operación" meta="VISTA DE PRODUCTO" footnote="Vista ilustrativa con datos de ejemplo.">
      <div className="mobilet-body">
        <div className="scene-heading-row">
          <div><span className="scene-overline">DETALLE DEL PEDIDO</span><h3>PED-DEMO-01</h3></div>
          <span className="scene-tag">Datos de ejemplo</span>
        </div>
        <div className="mobilet-tabs" role="tablist" aria-label="Recorrido del pedido">
          {mobiletSteps.map((item, index) => (
            <button key={item.title} type="button" role="tab" tabIndex={step === index ? 0 : -1} aria-selected={step === index} aria-controls={`${sceneId}-panel`} id={`${sceneId}-tab-${index}`} className={step === index ? 'is-selected' : ''} onClick={() => setStep(index)} onKeyDown={(event) => {
              const target = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null
              if (target === null) return
              event.preventDefault()
              setStep(target)
              event.currentTarget.parentElement.querySelectorAll('button')[target].focus()
            }}>
              <span className="mobilet-step-number">0{index + 1}</span>{item.title}
              {index < 2 && <span className="mobilet-step-arrow" aria-hidden="true">→</span>}
            </button>
          ))}
        </div>
        <div className="mobilet-detail" id={`${sceneId}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${sceneId}-tab-${step}`}>
          <h4>{current.heading}</h4>
          <p>{current.description}</p>
          <dl className="mobilet-fields">{current.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <button className="scene-text-action" type="button" onClick={() => setStep((step + 1) % mobiletSteps.length)}>{current.next}<span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </SceneFrame>
  )
}

export function LaSumaScene() {
  return (
    <figure className="case-scene lasuma-scene">
      <div className="lasuma-site">
        <div className="lasuma-masthead scene-step" data-scene-order="0">
          <div className="lasuma-brand" aria-label="La Suma punto mx"><img src="/assets/la-suma-symbol.svg" alt="" /><strong>LaSuma<span>.mx</span></strong></div>
          <div className="lasuma-nav" aria-label="Secciones del portal"><span>México</span><span>Mundo</span><span className="lasuma-nav-secondary">Economía</span><span>Cultura</span><span className="is-current">Tecnología</span></div>
        </div>
        <div className="lasuma-portal-window scene-step" data-scene-order="1">
          <img className="lasuma-portal-image" src="/assets/la-suma-floxia-portal-v2.png" width="1628" height="966" decoding="async" alt="Portada de muestra de La Suma. Titular: Floxia convierte procesos en productos digitales. Panel Por qué importa, columna Top Stories y secciones de operación, producto y automatización." />
        </div>
      </div>
      <figcaption className="lasuma-caption"><span>La Suma · Experiencia editorial</span><span>Nota ficticia sobre Floxia</span></figcaption>
    </figure>
  )
}

export function ReportsScene() {
  return (
    <SceneFrame className="reports-scene" label="Flujo / Reportes de operación" meta="DATOS DE EJEMPLO">
      <div className="reports-body scene-sequence">
        <div className="reports-input scene-step" data-scene-order="0"><span className="scene-overline">EL TÉCNICO TERMINA UNA VISITA</span><div className="reports-input-items"><span><span className="audio-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>Audio del técnico</span><span><span className="photo-mark" aria-hidden="true">JPG</span>Foto adjunta</span></div><blockquote>“Visita terminada. Filtro instalado. Falta confirmar la ubicación.”</blockquote></div>
        <div className="reports-steps scene-step" data-scene-order="1" aria-label="Transcribir el audio, ordenar la información y preparar el resumen">
          <div><span>01</span><strong>Transcribir</strong></div><i aria-hidden="true" />
          <div><span>02</span><strong>Ordenar</strong></div><i aria-hidden="true" />
          <div className="is-output"><span>03</span><strong>Resumir</strong></div>
        </div>
        <div className="reports-results">
          <div className="reports-review scene-step" data-scene-order="2"><span className="scene-overline">DATOS EXTRAÍDOS DEL AUDIO</span><dl><div><dt>Actividad</dt><dd>Instalación de filtro</dd></div><div><dt>Ubicación</dt><dd className="reports-missing">Por confirmar</dd></div><div><dt>Incidencia</dt><dd>No indicada</dd></div></dl><p><span aria-hidden="true">↳</span> Pide al técnico la ubicación.</p></div>
          <div className="reports-document scene-step" data-scene-order="3"><span className="scene-overline">PARA EL RESPONSABLE</span><h3>Resumen<br />del día</h3><div><span><strong>Realizado</strong>Filtro instalado</span><span><strong>Pendiente</strong>Confirmar ubicación</span></div><p>Borrador para revisión.<br />El dato pendiente sigue visible.</p></div>
        </div>
      </div>
    </SceneFrame>
  )
}

const agentRoles = [
  ['01', 'Necesidad', 'Entiende el pedido'],
  ['02', 'Existencias', 'Detecta faltantes'],
  ['03', 'Opciones', 'Compara cotizaciones'],
  ['04', 'Propuesta', 'Recomienda una compra'],
]

export function AgentsScene() {
  return (
    <SceneFrame className="agents-scene" label="Espacio de trabajo / Abastecimiento" meta="DEMO">
      <div className="agents-body">
        <div className="agents-sources"><span className="scene-overline">INFORMACIÓN DISPONIBLE</span><div><span>Solicitud de materiales</span><span>Inventario compartido</span><span>Cotizaciones recibidas</span></div></div>
        <div className="agents-roster">{agentRoles.map(([number, title, task]) => <div key={title}><span className="agent-number">{number}</span><div><h4>{title}</h4><p>{task}</p></div><span className="agent-connector" aria-hidden="true">↓</span></div>)}</div>
        <div className="agents-decision"><div><span className="scene-overline">ENTREGABLE</span><h3>Propuesta de compra</h3><span className="agents-pending">Pendiente de aprobación</span></div><div className="agents-human"><span aria-hidden="true">↗</span><strong>Tu equipo<br />autoriza</strong></div></div>
        <p className="agents-clarification"><span aria-hidden="true">↳</span> Si falta contexto, los agentes piden información.</p>
      </div>
    </SceneFrame>
  )
}
