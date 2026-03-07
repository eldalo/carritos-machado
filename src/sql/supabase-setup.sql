-- ============================================
-- Carritos Machado - Setup de Supabase
-- Ejecutar en: SQL Editor de Supabase
-- ============================================

-- 1. CREAR TABLAS
-- ============================================

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id TEXT NOT NULL,
  time_slot_id TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(day_id, time_slot_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id TEXT NOT NULL,
  time_slot_id TEXT NOT NULL,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(day_id, time_slot_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_slot ON assignments(day_id, time_slot_id);
CREATE INDEX IF NOT EXISTS idx_assignments_participant ON assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_slot ON blocked_slots(day_id, time_slot_id);

-- 2. DESHABILITAR RLS (temporal, hasta implementar Supabase Auth)
-- ============================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on blocked_slots" ON blocked_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);

-- 3. SEED: PARTICIPANTES
-- ============================================

INSERT INTO participants (name) VALUES
  ('Mary Rosa Rivera'),
  ('Yudi Rodriguez'),
  ('Cecilia Rincón'),
  ('Emilio Grisales'),
  ('Doris Grisales'),
  ('Ángela González'),
  ('Fanny Quintana'),
  ('Alba Lucia Tabares'),
  ('Judy Herrera'),
  ('Stella Ruiz'),
  ('Sulma Rengifo'),
  ('Asseneth Sánchez'),
  ('Andrés Cardona'),
  ('Leidy Cardona'),
  ('Jorge Meneses'),
  ('Diego Londoño'),
  ('Richard Tabares'),
  ('Madeleyn Tabares')
ON CONFLICT (name) DO NOTHING;

-- 4. SEED: BLOQUES
-- ============================================

INSERT INTO blocked_slots (day_id, time_slot_id, reason) VALUES
  ('lunes',    '10-12', NULL),
  ('lunes',    '12-14', NULL),
  ('martes',   '08-10', 'Predicación de casa en casa'),
  ('martes',   '10-12', NULL),
  ('martes',   '12-14', NULL),
  ('martes',   '18-20', 'Reunión VMC'),
  ('miercoles','10-12', NULL),
  ('miercoles','12-14', NULL),
  ('miercoles','18-20', 'Predicación de casa en casa'),
  ('jueves',   '10-12', NULL),
  ('jueves',   '12-14', NULL),
  ('jueves',   '18-20', 'Predicación de casa en casa'),
  ('viernes',  '08-10', 'Predicación de casa en casa'),
  ('viernes',  '10-12', NULL),
  ('viernes',  '12-14', NULL),
  ('sabado',   '08-10', 'Predicación de casa en casa'),
  ('sabado',   '10-12', NULL),
  ('sabado',   '12-14', NULL),
  ('sabado',   '18-20', 'Reunión Pública'),
  ('domingo',  '08-10', 'Predicación de casa en casa'),
  ('domingo',  '10-12', NULL),
  ('domingo',  '12-14', NULL)
ON CONFLICT (day_id, time_slot_id) DO NOTHING;

-- 5. SEED: ASIGNACIONES
-- ============================================

INSERT INTO assignments (day_id, time_slot_id, participant_id)
SELECT v.day_id, v.time_slot_id, p.id
FROM (VALUES
  ('lunes',    '06-08', 'Mary Rosa Rivera'),
  ('lunes',    '06-08', 'Yudi Rodriguez'),
  ('martes',   '06-08', 'Cecilia Rincón'),
  ('martes',   '06-08', 'Yudi Rodriguez'),
  ('miercoles','06-08', 'Mary Rosa Rivera'),
  ('miercoles','06-08', 'Cecilia Rincón'),
  ('viernes',  '06-08', 'Cecilia Rincón'),
  ('viernes',  '06-08', 'Yudi Rodriguez'),
  ('sabado',   '06-08', 'Jorge Meneses'),
  ('sabado',   '06-08', 'Diego Londoño'),
  ('domingo',  '06-08', 'Richard Tabares'),
  ('domingo',  '06-08', 'Madeleyn Tabares'),
  ('lunes',    '08-10', 'Emilio Grisales'),
  ('lunes',    '08-10', 'Doris Grisales'),
  ('miercoles','08-10', 'Emilio Grisales'),
  ('miercoles','08-10', 'Doris Grisales'),
  ('jueves',   '08-10', 'Sulma Rengifo'),
  ('jueves',   '08-10', 'Stella Ruiz'),
  ('miercoles','14-16', 'Ángela González'),
  ('miercoles','14-16', 'Fanny Quintana'),
  ('jueves',   '14-16', 'Ángela González'),
  ('jueves',   '14-16', 'Fanny Quintana'),
  ('lunes',    '16-18', 'Alba Lucia Tabares'),
  ('lunes',    '16-18', 'Ángela González'),
  ('martes',   '16-18', 'Judy Herrera'),
  ('martes',   '16-18', 'Stella Ruiz'),
  ('jueves',   '16-18', 'Cecilia Rincón'),
  ('jueves',   '16-18', 'Judy Herrera'),
  ('viernes',  '16-18', 'Sulma Rengifo'),
  ('viernes',  '16-18', 'Asseneth Sánchez'),
  ('lunes',    '18-20', 'Andrés Cardona'),
  ('lunes',    '18-20', 'Leidy Cardona')
) AS v(day_id, time_slot_id, participant_name)
JOIN participants p ON p.name = v.participant_name
ON CONFLICT (day_id, time_slot_id, participant_id) DO NOTHING;
