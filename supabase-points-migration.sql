-- ============================================
-- Carritos Machado - Points Migration
-- Ejecutar en: SQL Editor de Supabase
-- PRE-REQUISITO: supabase-points.sql debe estar ejecutado
-- ============================================

-- 1. Agregar columna point_id (nullable primero para migración)
ALTER TABLE blocked_slots ADD COLUMN IF NOT EXISTS point_id UUID;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS point_id UUID;

-- 2. Migrar datos existentes al punto "Alcalá"
UPDATE blocked_slots SET point_id = (SELECT id FROM points WHERE name = 'Alcalá') WHERE point_id IS NULL;
UPDATE assignments SET point_id = (SELECT id FROM points WHERE name = 'Alcalá') WHERE point_id IS NULL;

-- 3. Hacer NOT NULL
ALTER TABLE blocked_slots ALTER COLUMN point_id SET NOT NULL;
ALTER TABLE assignments ALTER COLUMN point_id SET NOT NULL;

-- 4. Foreign keys con CASCADE
ALTER TABLE blocked_slots ADD CONSTRAINT fk_blocked_slots_point
  FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE;
ALTER TABLE assignments ADD CONSTRAINT fk_assignments_point
  FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE;

-- 5. Actualizar constraints únicos (incluir point_id)
ALTER TABLE blocked_slots DROP CONSTRAINT IF EXISTS blocked_slots_day_id_time_slot_id_key;
ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_point_day_time_unique
  UNIQUE(point_id, day_id, time_slot_id);

ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_day_id_time_slot_id_participant_id_key;
ALTER TABLE assignments ADD CONSTRAINT assignments_point_day_time_participant_unique
  UNIQUE(point_id, day_id, time_slot_id, participant_id);

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_blocked_slots_point ON blocked_slots(point_id);
CREATE INDEX IF NOT EXISTS idx_assignments_point ON assignments(point_id);
