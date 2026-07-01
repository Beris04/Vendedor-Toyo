-- ATN CLIENTES 1.0 - Supabase schema
create extension if not exists pgcrypto;
create table if not exists clientes(
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nombre text not null,
  giro text default 'SIN GIRO',
  oficina text default 'OFICINA GDL',
  activo boolean default true,
  created_at timestamptz default now()
);
create table if not exists productos(
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  descripcion text not null,
  categoria text default 'SIN CATEGORIA',
  activo boolean default true,
  created_at timestamptz default now()
);
create table if not exists ventas_historial(
  id bigserial primary key,
  cliente_codigo text references clientes(codigo),
  producto_codigo text,
  producto_descripcion text not null,
  categoria text default 'SIN CATEGORIA',
  anio int not null,
  mes int not null,
  dia int,
  piezas numeric default 0,
  subtotal numeric default 0,
  agente text,
  oficina text default 'OFICINA GDL',
  carga_id text,
  created_at timestamptz default now()
);
create table if not exists orders(
  id uuid primary key default gen_random_uuid(),
  client_code text,
  client_name text not null,
  attended_by text not null,
  comments text,
  order_status text default 'capturado',
  created_at timestamptz default now()
);
create table if not exists order_items(
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_code text,
  product_desc text not null,
  category text default 'SIN CATEGORIA',
  qty numeric not null default 1,
  item_type text check (item_type in ('Histórico','Recuperado','Nuevo')) default 'Histórico',
  created_at timestamptz default now()
);
create or replace view v_cliente_categoria as
select cliente_codigo, categoria,
       max(make_date(anio, mes, coalesce(nullif(dia,0),1))) as ultima_compra,
       sum(piezas) as piezas,
       sum(subtotal) as venta
from ventas_historial
group by cliente_codigo, categoria;
create or replace view v_dashboard_categoria as
select categoria,
       count(distinct cliente_codigo) as clientes_con_historial,
       sum(piezas) as piezas,
       sum(subtotal) as venta
from ventas_historial
group by categoria;
