# Carritos Machado

Aplicaci&oacute;n web para gestionar los horarios de exhibidores de carritos. Permite organizar turnos semanales, asignar participantes, bloquear franjas horarias y administrar m&uacute;ltiples puntos de exhibici&oacute;n.

## Stack Tecnol&oacute;gico

| Tecnolog&iacute;a | Versi&oacute;n | Rol |
|------------|---------|-----|
| **React** | 18 | UI library |
| **TypeScript** | 5.9 | Tipado est&aacute;tico |
| **Vite** | 6 | Bundler y dev server |
| **Tailwind CSS** | 3.4 | Estilos utility-first |
| **React Router** | 6 | Navegaci&oacute;n SPA |
| **TanStack Query** | 5 | State management as&iacute;ncrono y cach&eacute; |
| **Supabase** | 2.x | Base de datos PostgreSQL, autenticaci&oacute;n RPC |

## Funcionalidades

### Autenticaci&oacute;n y Roles

La app utiliza un sistema de autenticaci&oacute;n propio basado en una funci&oacute;n RPC de Supabase (`authenticate_user`) que verifica credenciales con bcrypt. La sesi&oacute;n se persiste en `localStorage`.

Existen tres roles con permisos diferenciados:

| Permiso | Admin | Assistant | User |
|---------|:-----:|:---------:|:----:|
| Ver horarios | &check; | &check; | &check; |
| Editar horarios | &check; | &check; | |
| Ver participantes | &check; | &check; | &check; |
| Agregar/eliminar participantes | &check; | &check; | |
| Ver/editar bloques | &check; | | |
| CRUD de puntos | &check; | | |

### Horarios (`/horarios`)

Tabla semanal de 7 d&iacute;as &times; 7 franjas horarias (06:00 a 20:00, en bloques de 2 horas). Cada celda muestra los participantes asignados a ese turno. Los usuarios con permiso de edici&oacute;n pueden hacer click en una celda para abrir un modal de asignaci&oacute;n con:

- B&uacute;squeda por nombre
- L&iacute;mite de 2 participantes por turno
- Indicador de participantes ya asignados en otro turno del mismo d&iacute;a
- Celdas bloqueadas no son editables y muestran el motivo del bloqueo

### Participantes (`/participantes`)

Lista de todos los participantes registrados. Los roles admin y assistant pueden agregar nuevos participantes o eliminar existentes (con confirmaci&oacute;n). El rol user solo puede ver la lista y buscar por nombre. Las eliminaciones hacen cascade en las asignaciones.

### Bloques (`/bloques`)

Tabla de gesti&oacute;n de franjas bloqueadas (solo admin). Permite:

- Bloquear/desbloquear turnos haciendo click en las celdas
- Asignar un motivo al bloqueo (predefinidos o personalizado)
- Los motivos predefinidos incluyen: Predicaci&oacute;n de casa en casa, Reuni&oacute;n VMC, Reuni&oacute;n P&uacute;blica, No disponible
- Al bloquear un turno, las asignaciones existentes se eliminan autom&aacute;ticamente

### Puntos (`/puntos`)

CRUD de puntos de exhibici&oacute;n (solo admin). Cada punto tiene nombre y descripci&oacute;n opcional. Al eliminar un punto, se eliminan en cascada todos sus bloques y asignaciones.

Los horarios y bloques est&aacute;n relacionados con un punto espec&iacute;fico. Un dropdown de selecci&oacute;n de punto aparece en las p&aacute;ginas de Horarios y Bloques para filtrar los datos por ubicaci&oacute;n.

### P&aacute;gina P&uacute;blica (`/publico`)

Vista de solo lectura de los horarios, accesible sin autenticaci&oacute;n. Pensada para compartir el link directamente con los participantes. Incluye:

- Header m&iacute;nimo con logo y toggle de tema
- Selector de punto
- Tabla de horarios id&eacute;ntica a la vista autenticada pero sin interacci&oacute;n
- No aparece en el men&uacute; de navegaci&oacute;n, se accede por link directo

### Tema Dark / Light

Toggle de tema disponible en el navbar (p&aacute;ginas autenticadas) y en la p&aacute;gina p&uacute;blica. La preferencia se persiste en `localStorage` y respeta la configuraci&oacute;n `prefers-color-scheme` del sistema como valor por defecto.

## Estructura del Proyecto

```
src/
├── components/
│   ├── Layout.tsx              # Navbar + Outlet (rutas autenticadas)
│   ├── PointSelector.tsx       # Dropdown de selecci&oacute;n de punto
│   ├── ProtectedRoute.tsx      # Wrapper de rutas que requieren login
│   └── RoleRoute.tsx           # Wrapper de rutas por permiso
├── context/
│   ├── AuthContext.tsx          # Provider de autenticaci&oacute;n y sesi&oacute;n
│   └── ThemeContext.tsx         # Provider de tema dark/light
├── data/
│   └── scheduleData.ts         # Constantes: d&iacute;as, franjas, motivos de bloqueo
├── hooks/
│   ├── useLocalStorage.ts      # Hook gen&eacute;rico para localStorage
│   ├── usePermissions.ts       # Permisos por rol
│   ├── useSelectedPoint.ts     # Estado compartido del punto seleccionado
│   └── useSupabase.ts          # Hooks de TanStack Query para cada entidad
├── lib/
│   └── supabase.ts             # Cliente de Supabase
├── pages/
│   ├── BlockManager.tsx        # Gesti&oacute;n de bloques
│   ├── Login.tsx               # P&aacute;gina de login
│   ├── Participants.tsx        # CRUD de participantes
│   ├── Points.tsx              # CRUD de puntos
│   ├── PublicSchedule.tsx      # Vista p&uacute;blica de horarios
│   └── Schedule.tsx            # Tabla de horarios + asignaci&oacute;n
├── types/
│   └── database.ts             # Interfaces TypeScript de las tablas
├── App.tsx                     # Rutas y providers
├── index.css                   # Estilos base de Tailwind
└── main.tsx                    # Entry point
```

## Base de Datos

### Tablas

| Tabla | Descripci&oacute;n |
|-------|------------|
| `roles` | Roles del sistema (admin, assistant, user) |
| `users` | Usuarios con contrase&ntilde;a bcrypt y FK a roles |
| `participants` | Participantes que se asignan a los turnos |
| `points` | Puntos de exhibici&oacute;n (ubicaciones) |
| `blocked_slots` | Franjas bloqueadas por punto, d&iacute;a y horario |
| `assignments` | Asignaciones de participantes por punto, d&iacute;a y horario |

### Relaciones

```
roles ──< users
points ──< blocked_slots
points ──< assignments
participants ──< assignments
```

Los `ON DELETE CASCADE` est&aacute;n configurados en:
- `assignments.participant_id` &rarr; al eliminar un participante se borran sus asignaciones
- `blocked_slots.point_id` &rarr; al eliminar un punto se borran sus bloques
- `assignments.point_id` &rarr; al eliminar un punto se borran sus asignaciones

### Scripts SQL

Los scripts se ejecutan en orden en el SQL Editor de Supabase:

| Orden | Archivo | Descripci&oacute;n |
|:-----:|---------|------------|
| 1 | `supabase-setup.sql` | Tablas base (participants, blocked_slots, assignments) + datos iniciales |
| 2 | `supabase-auth.sql` | Extensi&oacute;n pgcrypto, tablas roles/users, funci&oacute;n RPC de auth, usuarios iniciales |
| 3 | `supabase-points.sql` | Tabla points + punto inicial |
| 4 | `supabase-points-migration.sql` | Agrega `point_id` a blocked_slots y assignments, migra datos existentes, actualiza constraints |

## Instalaci&oacute;n

### Prerrequisitos

- Node.js 18+
- Un proyecto en [Supabase](https://supabase.com)

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repo>
   cd carritos-machado
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear un archivo `.env` en la ra&iacute;z del proyecto:

   ```env
   VITE_SUPABASE_URL=<tu-supabase-url>
   VITE_SUPABASE_ANON_KEY=<tu-supabase-anon-key>
   ```

4. **Configurar la base de datos**

   Ejecutar los scripts SQL en el SQL Editor de Supabase, en este orden:

   1. `supabase-setup.sql`
   2. `supabase-auth.sql`
   3. `supabase-points.sql`
   4. `supabase-points-migration.sql`

5. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La app estar&aacute; disponible en `http://localhost:5173`

### Build de producci&oacute;n

```bash
npm run build
```

Los archivos se generan en `dist/`. Se puede previsualizar con:

```bash
npm run preview
```

## Rutas

| Ruta | Acceso | Descripci&oacute;n |
|------|--------|------------|
| `/login` | P&uacute;blico | Inicio de sesi&oacute;n |
| `/publico` | P&uacute;blico | Vista de horarios sin autenticaci&oacute;n |
| `/horarios` | Autenticado | Tabla de horarios con asignaci&oacute;n de turnos |
| `/participantes` | Autenticado | Gesti&oacute;n de participantes |
| `/bloques` | Admin | Gesti&oacute;n de franjas bloqueadas |
| `/puntos` | Admin | CRUD de puntos de exhibici&oacute;n |

## Arquitectura

### Estado y Cach&eacute;

Toda la comunicaci&oacute;n con Supabase se hace a trav&eacute;s de hooks de TanStack Query (`useSupabase.ts`). Cada hook tiene:

- **Query keys** que incluyen el `pointId` para aislar el cach&eacute; por punto: `['assignments', pointId]`
- **`enabled: !!pointId`** para evitar queries sin punto seleccionado
- **Invalidaciones cruzadas** al mutar (ej: al bloquear un turno se invalidan tambi&eacute;n las asignaciones)

### Autenticaci&oacute;n

- No usa Supabase Auth nativo. Implementa su propia tabla `users` con contrase&ntilde;as hasheadas con bcrypt
- La autenticaci&oacute;n se hace v&iacute;a `supabase.rpc('authenticate_user', ...)`
- La sesi&oacute;n se guarda en `localStorage` como JSON
- `ProtectedRoute` redirige a `/login` si no hay sesi&oacute;n
- `RoleRoute` verifica permisos espec&iacute;ficos v&iacute;a `usePermissions`

### Tema

- Tailwind configurado con `darkMode: 'class'`
- `ThemeContext` gestiona el toggle y persiste en `localStorage`
- Al cargar, respeta `prefers-color-scheme` del sistema si no hay preferencia guardada
- La clase `dark` se aplica al elemento `<html>`
