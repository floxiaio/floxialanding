# Prospectos desde Floxia.io

## Estado al 22 de septiembre de 2026

- Implementado: formulario real, endpoint propio, validación, acuse de guardado, reintentos con UUID estable, recuperación de intento pendiente y estados accesibles.
- Publicado: landing activa en `https://www.floxia.io`, commit de código `0bde3be` y despliegue inicial `dpl_5TpEhZmNnQ71cMeWsK9qXr3YhkjD` (commit `6057062`). Receptor `https://bbjgpvuzalevunlugpuk.supabase.co/functions/v1/landing-leads` y migración `20260922210000` aplicados; Floxia Control muestra responsable y notas. Variables del webhook configuradas como sensibles Production del proyecto Vercel `prj_mJIG8zhX8YGdIAM65NsOeztckLGO` (`floxia-ais-projects/floxialanding`). El CTA de WhatsApp conserva la última versión aprobada.
- Verificado: [CI de publicación aprobada](https://github.com/floxiaio/floxialanding/actions/runs/35779762518), con 20 pruebas de cliente/servidor, lint sin errores (9 advertencias de imágenes preexistentes), build normal de producción y auditoría sin vulnerabilidades. El fallo local de permisos de Turbopack no ocurrió en CI ni Vercel; el build alternativo local con Webpack también pasó.
- Browser QA local con respuestas simuladas: doble clic, estado enviando, conservación de datos, recarga y reintento con UUID idéntico, confirmación y limpieza del intento pendiente, bloqueo y reapertura por `Retry-After`, rechazo de acuse con UUID distinto y vista móvil de 390 px sin desbordamiento. Ninguna prueba local escribió en Floxia Control.
- Prueba real: un único envío desde el formulario público devolvió `201`, `{ ok: true }` y UUID coincidente `b53389b9-3a88-41e3-a7a3-3f76b9906b75`. El navegador mostró éxito, limpió el intento pendiente y registró exactamente una solicitud. Backend confirmó un recibo y un cliente en estado Prospecto, con responsable inicial `riosje@gmail.com` y mensaje, origen y URL íntegros. El registro permanece identificado como **PRUEBA SINTÉTICA - NO CONTACTAR**, con correo reservado `qa-landing-20260922@example.invalid`. No se enviaron correos ni WhatsApp.

- Idempotencia y acceso comprobados por backend: ocho reintentos concurrentes con el mismo UUID/contenido y hashes de IP distintos devolvieron `200`; reutilizar el UUID con mensaje cambiado devolvió `409`. Recuento final: un recibo y un cliente; sin consumo adicional de cuotas ni cambios de responsable/notas. Las reglas RLS, ejecutadas como el usuario autenticado responsable, permiten consultar ese prospecto y su necesidad.

- Credenciales: ambas variables se cargaron por stdin sin imprimir valores. Backend confirmó la eliminación de las copias temporales de transferencia al terminar las pruebas.

## Recorrido y contrato

Navegador → `POST /api/leads` → Supabase Edge Function `landing-leads` → Floxia Control, Clientes → Prospecto.

El navegador envía `{ submission_id, name, email, need, page_url, website }`. `website` es un honeypot auxiliar; no llega al receptor. El servidor normaliza nombre/mensaje, convierte email a minúsculas y fija `source`. No acepta responsable, IP ni hash suministrados por el visitante.

El receptor recibe JSON autenticado con `Authorization: Bearer <secreto>`:

```json
{
  "schema_version": 1,
  "submission_id": "UUID",
  "name": "Nombre",
  "email": "persona@example.com",
  "message": "Necesidad",
  "source": "floxia.io",
  "page_url": "https://www.floxia.io/",
  "client_ip_hash": "HMAC-SHA256 hexadecimal de 64 caracteres"
}
```

Límites tras trim: nombre 1–120, email válido hasta 254, mensaje 1–5000, URL hasta 2048 con origen `https://www.floxia.io` o `https://floxia.io`, JSON máximo 16 KiB medido en bytes. La URL no admite credenciales ni fragmento. URLs de casos conservan su query.

Solo `200/201` con `{ ok: true, submission_id }` coincidente confirma éxito. Fallos, timeouts y acuses incompletos conservan datos e identificador para un reintento manual. `409` indica UUID reutilizado con otro contenido; `429` conserva `Retry-After`. Errores internos/configuración se traducen a `503` sin detalles sensibles.

## Credenciales y despliegue

Configurar en el proyecto Vercel `floxia-ais-projects/floxialanding`, entorno Production:

- `FLOXIA_LEADS_WEBHOOK_URL`: URL HTTPS de la función publicada.
- `FLOXIA_LEADS_WEBHOOK_SECRET`: secreto compartido generado por backend, mínimo 32 caracteres, almacenado como variable sensible.
- `NEXT_PUBLIC_SITE_URL=https://www.floxia.io`: valor público para metadata.

No usar prefijo `NEXT_PUBLIC_` para las dos variables del webhook. No imprimir secretos, incluirlos en argumentos de shell ni guardarlos en Git. Transferir por un archivo local ignorado de permisos 0600; cargar por stdin/SDK y eliminar la copia temporal al terminar. Un cambio de variables requiere despliegue nuevo.

En producción se exige Vercel y una IP válida de `x-vercel-forwarded-for`, cabecera escrita por su infraestructura ([referencia oficial](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for)). Se calcula HMAC-SHA256 con el secreto compartido. Nunca se reenvía IP cruda. Fuera de Vercel el servidor de producción falla de forma cerrada; el desarrollo local usa una IP loopback fija sin confiar en cabeceras externas.

El endpoint permite los orígenes públicos y el `VERCEL_URL` propio del despliegue; desarrollo admite localhost. Esto complementa, pero no sustituye, límites persistentes del receptor por IP/email/global. La guardia local adicional limita 20 intentos/minuto por hash y su memoria está acotada. Límites acordados para el receptor: IP 5/15 minutos y 20/día; email 3/hora y 10/día; global 100/hora y 500/día. Reintentos idempotentes no consumen cuota persistente. El proxy conserva `Retry-After` hasta 86400 segundos. El receptor debe aplicar límites durables atómicos y validar credenciales antes de cualquier escritura.

## Idempotencia y asignación

El formulario bloquea doble clic y conserva el UUID mientras el contenido normalizado sea el mismo. Un cambio de contenido genera UUID nuevo. El intento pendiente se guarda en `sessionStorage`, con caducidad de 24 horas; se elimina al confirmar y al cerrar la pestaña. Si el navegador bloquea almacenamiento, los reintentos conservan el UUID en memoria mientras la página siga abierta.

El backend es responsable de persistencia atómica, deduplicación durable y resolución de la cuenta existente `riosje@gmail.com`. Debe fallar si no puede asignarla. Nunca debe sobrescribir responsables existentes o reasignaciones posteriores. El frontend no envía ni conoce identificadores de CRM.

## Verificación

`npm run verify` ejecuta pruebas de contrato y cliente, lint, build y audit de producción. Las pruebas no escriben al receptor real. Para browser QA, simular `/api/leads` y comprobar doble clic, fallo/reintento con mismo UUID, recuperación tras recarga, `Retry-After` y acuses inválidos.

Para repetir una verificación futura, coordinar un solo envío desde el formulario con nombre/mensaje claramente sintéticos y email reservado `example.invalid`. Registrar UUID y solicitar a backend comprobar persistencia, visibilidad para `riosje@gmail.com`, responsable inicial e idempotencia. Un segundo envío con idéntico UUID solo sirve para verificar reintento sin crear otro prospecto. No enviar correos ni WhatsApp como parte de esta prueba.
