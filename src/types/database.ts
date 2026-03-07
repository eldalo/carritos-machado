export interface ParticipantRow {
  id: string
  name: string
  created_at: string
}

export interface BlockedSlotRow {
  id: string
  day_id: string
  time_slot_id: string
  reason: string | null
  created_at: string
}

export interface AssignmentRow {
  id: string
  day_id: string
  time_slot_id: string
  participant_id: string
  created_at: string
}

export interface AssignmentWithParticipant {
  id: string
  day_id: string
  time_slot_id: string
  participant_id: string
  created_at: string
  participants: { name: string }
}

export interface PointRow {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
