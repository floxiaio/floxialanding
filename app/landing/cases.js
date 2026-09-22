export const cases = [
  {
    id: "mobilet", number: "01", category: "Sistemas para operar", name: "Mobilet", real: true,
    title: "Del pedido al cobro. Una operación conectada.",
    built: "Un sistema que conecta inventario, pedidos, servicios, cobranza y facturación.",
    outcome: "Seguir un pedido y consultar su servicio y cobro relacionados.",
    steps: ["Pedido", "Servicio", "Cobro"],
    introduction: "Software a medida para coordinar la renta y el servicio de baños portátiles.",
    challenge: "Equipos, ubicaciones, pedidos, servicios y cobros necesitan compartir contexto. El reto es conectar cada parte de la operación para seguir el trabajo de principio a fin.",
    scope: ["Producto web", "UX/UI", "Desarrollo", "Integraciones", "Documentación"],
    detailSteps: [
      ["El pedido tiene contexto.", "Cliente, equipo y ubicación en el mismo registro."],
      ["El servicio puede seguirse.", "Actividades y responsables vinculados al pedido."],
      ["El cobro conserva su historia.", "Pagos y facturación relacionados con la operación."]
    ],
    note: "Sistema publicado. Las mejoras y los materiales recientes están preparados para la siguiente actualización. La vista de esta página usa datos de ejemplo.",
  },
  {
    id: "la-suma", number: "02", category: "Páginas y aplicaciones", name: "La Suma", real: true,
    title: "Un medio digital con identidad propia.",
    built: "Un portal con secciones, artículos, comunidades y gestión de contenidos.",
    outcome: "Encontrar una noticia y leerla con claridad en escritorio y móvil.",
    steps: ["Sección", "Artículo", "Lectura móvil"],
    introduction: "Una experiencia editorial para descubrir noticias y comunidades desde cualquier pantalla.",
    challenge: "Dar una estructura reconocible a la publicación: conectar portada, secciones, artículos y comunidades, con una experiencia de lectura que se adapte a escritorio y móvil.",
    scope: ["Producto web", "Diseño editorial", "Desarrollo", "Gestión de contenidos"],
    detailSteps: [
      ["Una portada que orienta.", "Las secciones y los contenidos destacados ayudan a descubrir qué leer."],
      ["El artículo tiene su espacio.", "La jerarquía editorial organiza el título, el contenido y la navegación."],
      ["La lectura continúa en móvil.", "El mismo producto adapta su composición a una pantalla más pequeña."]
    ],
    note: "Proyecto real. El mockup conserva la identidad y la estructura del portal La Suma; la nota sobre Floxia y su ilustración son contenido ficticio de muestra.",
  },
  {
    id: "reportes-de-operacion", number: "03", category: "Automatizaciones", name: "Reportes de operación", real: false,
    title: "Del reporte de campo al resumen diario.",
    built: "El técnico envía un audio y una foto al terminar una visita. El flujo transcribe, organiza los datos y pide lo que falta.",
    outcome: "El responsable recibe un borrador diario con el trabajo realizado, las incidencias y los pendientes por resolver.",
    steps: ["Audio y foto", "Datos organizados", "Resumen del día"],
    introduction: "Una aplicación ilustrativa para equipos de mantenimiento y servicio en campo: convertir los reportes de cada visita en un resumen que el responsable pueda revisar.",
    challenge: "Al terminar una visita, el técnico envía una nota de voz y una foto de la actividad. El flujo necesita separar lo realizado, la ubicación y las incidencias, detectar datos faltantes y reunir las visitas del día sin perder los pendientes.",
    scope: ["Audio y fotos", "Transcripción", "Datos por visita", "Solicitud de faltantes", "Resumen diario"],
    detailSteps: [
      ["El técnico reporta la visita.", "Envía un audio con lo que hizo y adjunta una foto. El flujo transcribe la voz, extrae actividad, ubicación e incidencias, y conserva la foto junto al registro."],
      ["El flujo pide lo que falta.", "Si no se indicó la ubicación, solicita ese dato al técnico y lo mantiene marcado como pendiente. Ordenar la información no verifica por sí solo lo ocurrido en campo."],
      ["El responsable revisa el día.", "Recibe un borrador con las actividades realizadas, las incidencias reportadas y los datos o acciones pendientes. Así puede identificar qué necesita seguimiento."]
    ],
    note: "Ejemplo ilustrativo basado en capacidades desarrolladas. No se presenta como un proyecto industrial entregado a un cliente.",
  },
  {
    id: "agentes-de-abastecimiento", number: "04", category: "Agentes de IA", name: "Agentes para abastecimiento", real: false,
    title: "Del requerimiento a una propuesta de compra.",
    built: "Agentes que trabajan con requisitos, existencias y cotizaciones proporcionadas por tu equipo.",
    outcome: "Preparar una propuesta de compra para que tu equipo evalúe y autorice.",
    steps: ["Necesidad", "Existencias", "Opciones", "Propuesta"],
    introduction: "Un ejemplo de agentes que coordinan información para apoyar una decisión de abastecimiento.",
    challenge: "Entender una solicitud de materiales, identificar faltantes y comparar alternativas con la información disponible. La propuesta debe explicar qué recomienda y dejar la decisión en manos del equipo.",
    scope: ["Coordinación de agentes", "Consulta de documentos", "Comparación", "Aprobación humana"],
    detailSteps: [
      ["Entender lo necesario.", "La solicitud de materiales y el inventario compartido permiten identificar lo que hace falta."],
      ["Comparar las opciones.", "Los agentes revisan las cotizaciones recibidas y piden información cuando no es suficiente."],
      ["Proponer, después autorizar.", "La recomendación queda pendiente de aprobación. Tu equipo decide; la demostración no ejecuta compras ni pagos."]
    ],
    note: "Ejemplo ilustrativo basado en capacidades desarrolladas. La experiencia en coordinación de agentes sustenta la propuesta; esta aplicación a abastecimiento es una demo.",
  },
];
