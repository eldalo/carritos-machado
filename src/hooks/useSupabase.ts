import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { BlockedSlots, Assignments } from '../data/scheduleData'
import type { AssignmentWithParticipant, PointRow } from '../types/database'

// --- Helpers ---

function parseSlotKey(key: string): { dayId: string; timeSlotId: string } {
  const firstDash = key.indexOf('-')
  return {
    dayId: key.substring(0, firstDash),
    timeSlotId: key.substring(firstDash + 1),
  }
}

// --- Participantes ---

export function useParticipants() {
  return useQuery({
    queryKey: ['participants'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('participants')
        .select('name')
        .order('name')
      if (error) throw new Error(error.message)
      return data.map((p) => p.name)
    },
  })
}

export function useAddParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string): Promise<void> => {
      const { error } = await supabase
        .from('participants')
        .insert({ name })
      if (error) {
        if (error.code === '23505') {
          throw new Error('El participante ya existe')
        }
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string): Promise<void> => {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('name', name)
      if (error) throw new Error(error.message)
      // CASCADE en la FK borra las asignaciones automáticamente
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

// --- Bloques ---

export function useBlockedSlots(pointId: string) {
  return useQuery({
    queryKey: ['blockedSlots', pointId],
    queryFn: async (): Promise<BlockedSlots> => {
      const { data, error } = await supabase
        .from('blocked_slots')
        .select('day_id, time_slot_id, reason')
        .eq('point_id', pointId)
      if (error) throw new Error(error.message)
      const result: BlockedSlots = {}
      for (const row of data) {
        const key = `${row.day_id}-${row.time_slot_id}`
        result[key] = { reason: row.reason || '' }
      }
      return result
    },
    enabled: !!pointId,
  })
}

interface ToggleBlockParams {
  slotKey: string
  reason?: string
}

export function useToggleBlock(pointId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotKey, reason }: ToggleBlockParams): Promise<void> => {
      const { dayId, timeSlotId } = parseSlotKey(slotKey)

      // Verificar si ya está bloqueado
      const { data: existing } = await supabase
        .from('blocked_slots')
        .select('id')
        .eq('point_id', pointId)
        .eq('day_id', dayId)
        .eq('time_slot_id', timeSlotId)
        .maybeSingle()

      if (existing) {
        // Desbloquear
        const { error } = await supabase
          .from('blocked_slots')
          .delete()
          .eq('id', existing.id)
        if (error) throw new Error(error.message)
      } else {
        // Bloquear
        const { error } = await supabase
          .from('blocked_slots')
          .insert({ point_id: pointId, day_id: dayId, time_slot_id: timeSlotId, reason: reason || null })
        if (error) throw new Error(error.message)

        // Eliminar asignaciones de ese slot
        await supabase
          .from('assignments')
          .delete()
          .eq('point_id', pointId)
          .eq('day_id', dayId)
          .eq('time_slot_id', timeSlotId)

        queryClient.invalidateQueries({ queryKey: ['assignments', pointId] })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots', pointId] })
    },
  })
}

interface UpdateBlockReasonParams {
  slotKey: string
  reason: string
}

export function useUpdateBlockReason(pointId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotKey, reason }: UpdateBlockReasonParams): Promise<void> => {
      const { dayId, timeSlotId } = parseSlotKey(slotKey)
      const { error } = await supabase
        .from('blocked_slots')
        .update({ reason })
        .eq('point_id', pointId)
        .eq('day_id', dayId)
        .eq('time_slot_id', timeSlotId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots', pointId] })
    },
  })
}

// --- Asignaciones ---

export function useAssignments(pointId: string) {
  return useQuery({
    queryKey: ['assignments', pointId],
    queryFn: async (): Promise<Assignments> => {
      const { data, error } = await supabase
        .from('assignments')
        .select('day_id, time_slot_id, participant_id, participants(name)')
        .eq('point_id', pointId)
      if (error) throw new Error(error.message)

      const result: Assignments = {}
      for (const row of data as unknown as AssignmentWithParticipant[]) {
        const key = `${row.day_id}-${row.time_slot_id}`
        if (!result[key]) result[key] = []
        if (row.participants?.name) {
          result[key].push(row.participants.name)
        }
      }
      return result
    },
    enabled: !!pointId,
  })
}

interface UpdateAssignmentParams {
  slotKey: string
  participants: string[]
}

export function useUpdateAssignment(pointId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotKey, participants: names }: UpdateAssignmentParams): Promise<void> => {
      const { dayId, timeSlotId } = parseSlotKey(slotKey)

      // Eliminar asignaciones actuales de este slot
      const { error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .eq('point_id', pointId)
        .eq('day_id', dayId)
        .eq('time_slot_id', timeSlotId)
      if (deleteError) throw new Error(deleteError.message)

      if (names.length > 0) {
        // Buscar IDs de participantes por nombre
        const { data: participantRows, error: fetchError } = await supabase
          .from('participants')
          .select('id, name')
          .in('name', names)
        if (fetchError) throw new Error(fetchError.message)

        const inserts = (participantRows || []).map((p) => ({
          point_id: pointId,
          day_id: dayId,
          time_slot_id: timeSlotId,
          participant_id: p.id,
        }))

        if (inserts.length > 0) {
          const { error: insertError } = await supabase
            .from('assignments')
            .insert(inserts)
          if (insertError) throw new Error(insertError.message)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', pointId] })
    },
  })
}

// --- Puntos ---

export function usePoints() {
  return useQuery({
    queryKey: ['points'],
    queryFn: async (): Promise<PointRow[]> => {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .order('name')
      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useAddPoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (point: { name: string; description?: string }): Promise<void> => {
      const { error } = await supabase
        .from('points')
        .insert({ name: point.name, description: point.description || null })
      if (error) {
        if (error.code === '23505') throw new Error('El punto ya existe')
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })
}

export function useUpdatePoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (point: { id: string; name: string; description?: string }): Promise<void> => {
      const { error } = await supabase
        .from('points')
        .update({ name: point.name, description: point.description || null, updated_at: new Date().toISOString() })
        .eq('id', point.id)
      if (error) {
        if (error.code === '23505') throw new Error('Ya existe un punto con ese nombre')
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })
}

export function useRemovePoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('points')
        .delete()
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] })
    },
  })
}
