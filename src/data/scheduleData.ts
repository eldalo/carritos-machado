export interface Day {
  id: string
  label: string
}

export interface TimeSlot {
  id: string
  label: string
}

export interface BlockInfo {
  reason: string
}

export type BlockedSlots = Record<string, BlockInfo>
export type Assignments = Record<string, string[]>

export const DAYS: Day[] = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
]

export const TIME_SLOTS: TimeSlot[] = [
  { id: '06-08', label: '06:00 - 08:00' },
  { id: '08-10', label: '08:00 - 10:00' },
  { id: '10-12', label: '10:00 - 12:00' },
  { id: '12-14', label: '12:00 - 14:00' },
  { id: '14-16', label: '14:00 - 16:00' },
  { id: '16-18', label: '16:00 - 18:00' },
  { id: '18-20', label: '18:00 - 20:00' },
]

export const DEFAULT_BLOCKED_SLOTS: BlockedSlots = {
  'lunes-10-12': { reason: '' },
  'lunes-12-14': { reason: '' },
  'martes-08-10': { reason: 'Predicación de casa en casa' },
  'martes-10-12': { reason: '' },
  'martes-12-14': { reason: '' },
  'martes-18-20': { reason: 'Reunión VMC' },
  'miercoles-10-12': { reason: '' },
  'miercoles-12-14': { reason: '' },
  'miercoles-18-20': { reason: 'Predicación de casa en casa' },
  'jueves-10-12': { reason: '' },
  'jueves-12-14': { reason: '' },
  'jueves-18-20': { reason: 'Predicación de casa en casa' },
  'viernes-08-10': { reason: 'Predicación de casa en casa' },
  'viernes-10-12': { reason: '' },
  'viernes-12-14': { reason: '' },
  'sabado-08-10': { reason: 'Predicación de casa en casa' },
  'sabado-10-12': { reason: '' },
  'sabado-12-14': { reason: '' },
  'sabado-18-20': { reason: 'Reunión Pública' },
  'domingo-08-10': { reason: 'Predicación de casa en casa' },
  'domingo-10-12': { reason: '' },
  'domingo-12-14': { reason: '' },
}

export const DEFAULT_ASSIGNMENTS: Assignments = {
  'lunes-06-08': ['Mary Rosa Rivera', 'Yudi Rodriguez'],
  'martes-06-08': ['Cecilia Rincón', 'Yudi Rodriguez'],
  'miercoles-06-08': ['Mary Rosa Rivera', 'Cecilia Rincón'],
  'viernes-06-08': ['Cecilia Rincón', 'Yudi Rodriguez'],
  'sabado-06-08': ['Jorge Meneses', 'Diego Londoño'],
  'domingo-06-08': ['Richard Tabares', 'Madeleyn Tabares'],
  'lunes-08-10': ['Emilio Grisales', 'Doris Grisales'],
  'miercoles-08-10': ['Emilio Grisales', 'Doris Grisales'],
  'jueves-08-10': ['Sulma Rengifo', 'Stella Ruiz'],
  'miercoles-14-16': ['Ángela González', 'Fanny Quintana'],
  'jueves-14-16': ['Ángela González', 'Fanny Quintana'],
  'lunes-16-18': ['Alba Lucia Tabares', 'Ángela González'],
  'martes-16-18': ['Judy Herrera', 'Stella Ruiz'],
  'jueves-16-18': ['Cecilia Rincón', 'Judy Herrera'],
  'viernes-16-18': ['Sulma Rengifo', 'Asseneth Sánchez'],
  'lunes-18-20': ['Andrés Cardona', 'Leidy Cardona'],
}

export const DEFAULT_PARTICIPANTS: string[] = [
  'Mary Rosa Rivera',
  'Yudi Rodriguez',
  'Cecilia Rincón',
  'Emilio Grisales',
  'Doris Grisales',
  'Ángela González',
  'Fanny Quintana',
  'Alba Lucia Tabares',
  'Judy Herrera',
  'Stella Ruiz',
  'Sulma Rengifo',
  'Asseneth Sánchez',
  'Andrés Cardona',
  'Leidy Cardona',
  'Jorge Meneses',
  'Diego Londoño',
  'Richard Tabares',
  'Madeleyn Tabares',
]

export const BLOCK_REASONS: string[] = [
  'Predicación de casa en casa',
  'Reunión VMC',
  'Reunión Pública',
  'No disponible',
]

export function getSlotKey(dayId: string, timeSlotId: string): string {
  return `${dayId}-${timeSlotId}`
}
