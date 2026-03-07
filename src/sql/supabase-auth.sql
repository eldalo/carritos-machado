-- ============================================
-- Carritos Machado - Auth Setup
-- Ejecutar en: SQL Editor de Supabase
-- ============================================

-- 1. EXTENSIÓN PARA ENCRIPTAR CONTRASEÑAS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  role_id UUID NOT NULL REFERENCES roles(id),
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS (políticas permisivas temporales)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on roles" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- 5. FUNCIÓN RPC DE AUTENTICACIÓN
--    Verifica contraseña con bcrypt y retorna datos del usuario
CREATE OR REPLACE FUNCTION authenticate_user(p_username TEXT, p_password TEXT)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT u.id, u.username, u.full_name, u.email, r.name as role_name
  INTO v_user
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.username = p_username
  AND u.password = crypt(p_password, u.password);

  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario o contraseña incorrectos');
  END IF;

  UPDATE users SET last_login = now() WHERE id = v_user.id;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'fullName', v_user.full_name,
      'email', v_user.email,
      'role', v_user.role_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. SEED: ROLES
INSERT INTO roles (name) VALUES
  ('admin'),
  ('assistant'),
  ('user')
ON CONFLICT (name) DO NOTHING;

-- 7. SEED: USUARIOS
-- Crear usuarios manualmente con el siguiente formato:
-- INSERT INTO users (username, role_id, password, full_name, email) VALUES
--   ('tu_usuario',
--     (SELECT id FROM roles WHERE name = 'admin'),  -- admin | assistant | user
--     crypt('tu_contraseña', gen_salt('bf')),
--     'Nombre Completo',
--     'email@ejemplo.com');
