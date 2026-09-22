# Floxia Landing

Landing de Floxia en Next.js, adaptada de la propuesta visual revisada el 22 de septiembre de 2026.

## Desarrollo

Requiere Node.js 20.9 o superior.

```bash
npm ci
npm run dev
```

## Verificación

```bash
npm run verify
```

Incluye lint, build de producción y auditoría de dependencias de producción. El workflow de GitHub ejecuta estos mismos controles al recibir cambios en main.

## Contenido e interacción

- Hero con identidad oficial, fondo animado y navegación superior desplegable.
- Cuatro secciones de igual altura: Mobilet, La Suma, reportes de operación y agentes de abastecimiento, con fondos alternados.
- Entradas marcadas de los mockups, aparición individual de audiencia y secuencia en los cuatro pasos de trabajo. Movimiento reducido y teclado conservan contenido visible.
- Detalles mediante `?caso=mobilet`, `?caso=la-suma`, `?caso=reportes-de-operacion` y `?caso=agentes-de-abastecimiento`.
- Mobilet y La Suma son proyectos reales. Reportes y agentes son ejemplos ilustrativos de capacidades desarrolladas. La portada de La Suma contiene una nota ficticia sobre Floxia.
- El formulario es una muestra: no envía ni guarda datos. Su conexión a un canal real de contacto queda pendiente.

## Despliegue

Se conserva la configuración Next.js/Vercel del repositorio. Configurar `NEXT_PUBLIC_SITE_URL` con el dominio final. El fallback existente sigue siendo `https://floxia.ai` para metadata, sitemap y robots.

No subir archivos .env, dependencias instaladas, builds ni capturas de trabajo. Los SVG de marca y las imágenes utilizadas por la landing están en public.
