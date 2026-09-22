# Seguridad

## Alcance Actual

Landing Next.js con endpoint público `POST /api/leads`. El endpoint valida el formulario y entrega los datos al receptor privado de Floxia Control. El navegador mantiene temporalmente el intento pendiente en `sessionStorage` para recuperar datos e idempotencia tras un fallo o recarga; caduca a las 24 horas y se elimina al confirmar. No almacena credenciales ni datos internos del CRM.

## Controles Incluidos

- Headers básicos de seguridad configurados en `next.config.mjs`.
- `X-Powered-By` deshabilitado.
- `.env*`, `.next`, `node_modules`, `.vercel` y logs locales ignorados por Git.
- JSON-LD serializado con escape de caracteres HTML antes de inyectarse.
- Dependencias de producción auditadas con `npm audit --omit=dev`.

- El secreto del webhook vive solo en servidor y nunca usa prefijo `NEXT_PUBLIC_`.
- JSON hasta 16 KiB, validación estricta de campos y origen, honeypot auxiliar, timeout y respuestas sin detalles internos.
- IP transformada con HMAC-SHA256; producción exige `VERCEL=1` y `x-vercel-forwarded-for`. No se aceptan IP/hash del navegador ni `x-forwarded-for` arbitrario.
- Guardia de ráfagas local (20 intentos/minuto por hash) complementa límites persistentes IP/email/global en receptor. CORS y honeypot no son la protección principal.
- Receptor responsable de idempotencia durable, persistencia atómica y asignación inicial. El proxy solo confirma un acuse válido `200/201` con UUID coincidente.

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
