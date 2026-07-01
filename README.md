# ATN Clientes 1.0 - Toyo Foods

Proyecto reconstruido desde cero con arquitectura estable.

## Archivos principales
- `index.html`: aplicación web.
- `styles.css`: diseño institucional.
- `app.js`: lógica modular.
- `config.js`: conexión Supabase y correos por sucursal.
- `data_seed.js`: base inicial para trabajar sin Supabase.
- `sql/supabase_schema.sql`: tablas y vistas para Supabase.
- `tools/import_monthly_data.py`: plantilla para importación mensual.

## Uso rápido en GitHub Pages
Sube al repositorio estos archivos:
- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `data_seed.js`

La app funciona en modo local aunque Supabase no esté configurado.

## Para operar con Supabase
1. Crea proyecto en Supabase.
2. Ejecuta `sql/supabase_schema.sql` en SQL Editor.
3. Copia URL y Anon Key a `config.js`.
4. Después los pedidos se guardarán en Supabase.

## Actualización mensual
La idea es no rehacer el HTML. Cada mes se importan ventas nuevas a `ventas_historial`, se actualizan clientes/productos si hay cambios, y los dashboards se recalculan.


## Conexión configurada

Este paquete ya incluye la URL y Anon Key de Supabase en `config.js`.

Para que guarde pedidos en Supabase, primero ejecuta `sql/supabase_schema.sql` en Supabase SQL Editor.

