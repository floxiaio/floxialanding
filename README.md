# Floxia IA Landing

Landing page de Floxia IA construida con Next.js, Tailwind CSS y TypeScript.

## Requisitos

- Node.js 20.9 o superior
- npm

## Desarrollo Local

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:3000`.

## Verificación Antes De Subir A GitHub

```bash
npm run verify
```

Este comando ejecuta lint, build de producción y auditoría de dependencias de producción.

## Deploy En Vercel

1. Crea el repo en GitHub y sube este proyecto.
2. Importa el repo desde Vercel.
3. Configura `NEXT_PUBLIC_SITE_URL` con el dominio final, por ejemplo:

```bash
NEXT_PUBLIC_SITE_URL=https://floxia.ai
```

Si todavía no tienes dominio confirmado, el proyecto usa `https://floxia.ai` como valor temporal para metadata, sitemap y JSON-LD.

## Seguridad

- No se deben subir archivos `.env*`.
- Los logs locales `codex-dev-*` están ignorados.
- La app incluye headers básicos de seguridad desde `next.config.mjs`.
- No hay rutas API, cookies, autenticación ni formularios en esta versión.
