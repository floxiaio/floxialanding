# Seguridad

## Alcance Actual

Esta versión es una landing estática en Next.js. No incluye rutas API, autenticación, cookies, carga de archivos, base de datos ni almacenamiento del lado del cliente. El formulario de contacto es una muestra local que no envía ni persiste datos.

## Controles Incluidos

- Headers básicos de seguridad configurados en `next.config.mjs`.
- `X-Powered-By` deshabilitado.
- `.env*`, `.next`, `node_modules`, `.vercel` y logs locales ignorados por Git.
- JSON-LD serializado con escape de caracteres HTML antes de inyectarse.
- Dependencias de producción auditadas con `npm audit --omit=dev`.

## Verificación Recomendada

Antes de publicar o abrir un pull request:

```bash
npm run verify
```

## Variables De Entorno

`NEXT_PUBLIC_SITE_URL` es pública porque se usa en metadata, sitemap y JSON-LD. No debe usarse para secretos.

Nunca agregues secretos con prefijo `NEXT_PUBLIC_`, porque Next.js los expone al navegador.

## Reporte De Problemas

Si encuentras un problema de seguridad, repórtalo por correo a `floxiaai@gmail.com`.
