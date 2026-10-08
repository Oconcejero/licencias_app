-- ========================================================
-- SCRIPT DE INICIALIZACIÓN DE TABLAS PARA LICENCIAS TAXI
-- Copia y pega todo este contenido en el 'SQL Editor' de Supabase y pulsa 'RUN'
-- ========================================================

-- 1. TABLA DE VENDEDORES (Licencias en venta)
CREATE TABLE IF NOT EXISTS public.vendedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  perfil TEXT NOT NULL DEFAULT 'PARTICULAR',
  dia_libranza TEXT NOT NULL,
  carga_licencia TEXT NOT NULL DEFAULT 'SIN_CARGA',
  detalle_carga_licencia TEXT,
  vende_con_coche BOOLEAN DEFAULT FALSE,
  vehiculo JSONB,
  precio NUMERIC NOT NULL,
  precio_negociable BOOLEAN DEFAULT FALSE,
  condicion_venta TEXT DEFAULT 'INMEDIATA',
  fecha_jubilacion TEXT,
  detalle_condicion TEXT,
  notas TEXT,
  estado TEXT DEFAULT 'DISPONIBLE'
);

-- 2. TABLA DE COMPRADORES (Personas buscando licencia)
CREATE TABLE IF NOT EXISTS public.compradores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  perfil TEXT NOT NULL DEFAULT 'PARTICULAR',
  dia_libranza_deseada TEXT NOT NULL DEFAULT 'CUALQUIERA',
  precio_maximo NUMERIC NOT NULL,
  acepta_con_prestamo TEXT DEFAULT 'INDIFERENTE',
  puede_senalizar_ya BOOLEAN DEFAULT FALSE,
  busca_con_coche TEXT DEFAULT 'INDIFERENTE',
  tiene_gestoria BOOLEAN DEFAULT FALSE,
  gestoria_seleccionada TEXT DEFAULT 'NINGUNA',
  nombre_gestoria_propia TEXT,
  guardado_en_espera BOOLEAN DEFAULT FALSE,
  notas TEXT,
  estado TEXT DEFAULT 'DISPONIBLE'
);

-- 3. TABLA DE CONFIGURACIÓN (Amigo tramitador y cruces derivados)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- 4. POLÍTICAS DE ACCESO PÚBLICO (Para sincronización directa con tu app)
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all vendedores" ON public.vendedores;
CREATE POLICY "Allow public all vendedores" ON public.vendedores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all compradores" ON public.compradores;
CREATE POLICY "Allow public all compradores" ON public.compradores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all app_config" ON public.app_config;
CREATE POLICY "Allow public all app_config" ON public.app_config FOR ALL USING (true) WITH CHECK (true);

-- 5. ACTUALIZACIÓN MULTICANAL (Wallapop, Milanuncios, Facebook, etc.)
ALTER TABLE public.vendedores ADD COLUMN IF NOT EXISTS canal_contacto TEXT DEFAULT 'TELEFONO';
ALTER TABLE public.vendedores ADD COLUMN IF NOT EXISTS contacto_origen TEXT;

ALTER TABLE public.compradores ADD COLUMN IF NOT EXISTS canal_contacto TEXT DEFAULT 'TELEFONO';
ALTER TABLE public.compradores ADD COLUMN IF NOT EXISTS contacto_origen TEXT;
