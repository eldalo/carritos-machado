-- ============================================
-- Carritos Machado - Points Setup
-- Ejecutar en: SQL Editor de Supabase
-- ============================================

-- 1. TABLA DE PUNTOS
CREATE TABLE IF NOT EXISTS points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on points" ON points FOR ALL USING (true) WITH CHECK (true);

-- 3. SEED: Punto por defecto
INSERT INTO points (name, description) VALUES
  ('Alcalá', 'Punto principal')
ON CONFLICT (name) DO NOTHING;
