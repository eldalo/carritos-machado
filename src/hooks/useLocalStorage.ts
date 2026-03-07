import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DEFAULT_PARTICIPANTS,
  DEFAULT_BLOCKED_SLOTS,
  DEFAULT_ASSIGNMENTS,
} from '../data/scheduleData'
import type { BlockedSlots, Assignments } from '../data/scheduleData'

const STORAGE_KEYS = {
  participants: 'cm_participants',
  blockedSlots: 'cm_blocked_slots',
  assignments: 'cm_assignments',
} as const

function getFromStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key)
  if (stored) {
    return JSON.parse(stored) as T
  }
  localStorage.setItem(key, JSON.stringify(defaultValue))
  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Participantes ---

export function useParticipants() {
  return useQuery({
    queryKey: ['participants'],
    queryFn: (): string[] => getFromStorage(STORAGE_KEYS.participants, DEFAULT_PARTICIPANTS),
    staleTime: Infinity,
  })
}

export function useAddParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string): Promise<string[]> => {
      const current = getFromStorage<string[]>(STORAGE_KEYS.participants, DEFAULT_PARTICIPANTS)
      if (current.includes(name)) {
        throw new Error('El participante ya existe')
      }
      const updated = [...current, name]
      saveToStorage(STORAGE_KEYS.participants, updated)
      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['participants'], data)
    },
  })
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string): Promise<string[]> => {
      const current = getFromStorage<string[]>(STORAGE_KEYS.participants, DEFAULT_PARTICIPANTS)
      const updated = current.filter((p) => p !== name)
      saveToStorage(STORAGE_KEYS.participants, updated)

      const assignments = getFromStorage<Assignments>(STORAGE_KEYS.assignments, DEFAULT_ASSIGNMENTS)
      const updatedAssignments: Assignments = {}
      for (const [key, names] of Object.entries(assignments)) {
        const filtered = names.filter((n) => n !== name)
        if (filtered.length > 0) {
          updatedAssignments[key] = filtered
        }
      }
      saveToStorage(STORAGE_KEYS.assignments, updatedAssignments)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })

      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['participants'], data)
    },
  })
}

// --- Bloques ---

export function useBlockedSlots() {
  return useQuery({
    queryKey: ['blockedSlots'],
    queryFn: (): BlockedSlots => getFromStorage(STORAGE_KEYS.blockedSlots, DEFAULT_BLOCKED_SLOTS),
    staleTime: Infinity,
  })
}

interface ToggleBlockParams {
  slotKey: string
  reason?: string
}

export function useToggleBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotKey, reason }: ToggleBlockParams): Promise<BlockedSlots> => {
      const current = getFromStorage<BlockedSlots>(STORAGE_KEYS.blockedSlots, DEFAULT_BLOCKED_SLOTS)
      let updated: BlockedSlots
      if (current[slotKey]) {
        const { [slotKey]: _, ...rest } = current
        updated = rest
      } else {
        updated = { ...current, [slotKey]: { reason: reason || '' } }
      }
      saveToStorage(STORAGE_KEYS.blockedSlots, updated)

      if (!current[slotKey]) {
        const assignments = getFromStorage<Assignments>(STORAGE_KEYS.assignments, DEFAULT_ASSIGNMENTS)
        const { [slotKey]: _, ...restAssignments } = assignments
        saveToStorage(STORAGE_KEYS.assignments, restAssignments)
        queryClient.invalidateQueries({ queryKey: ['assignments'] })
      }

      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['blockedSlots'], data)
    },
  })
}

interface UpdateBlockReasonParams {
  slotKey: string
  reason: string
}

export function useUpdateBlockReason() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotKey, reason }: UpdateBlockReasonParams): Promise<BlockedSlots> => {
      const current = getFromStorage<BlockedSlots>(STORAGE_KEYS.blockedSlots, DEFAULT_BLOCKED_SLOTS)
      if (!current[slotKey]) return current
      const updated = { ...current, [slotKey]: { reason } }
      saveToStorage(STORAGE_KEYS.blockedSlots, updated)
      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['blockedSlots'], data)
    },
  })
}

// --- Asignaciones ---

export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: (): Assignments => getFromStorage(STORAGE_KEYS.assignments, DEFAULT_ASSIGNMENTS),
    staleTime: Infinity,
  })
}

interface UpdateAssignmentParams {
  slotKey: string
  participants: string[]
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ slotKey, participants }: UpdateAssignmentParams): Promise<Assignments> => {
      const current = getFromStorage<Assignments>(STORAGE_KEYS.assignments, DEFAULT_ASSIGNMENTS)
      let updated: Assignments
      if (participants.length === 0) {
        const { [slotKey]: _, ...rest } = current
        updated = rest
      } else {
        updated = { ...current, [slotKey]: participants }
      }
      saveToStorage(STORAGE_KEYS.assignments, updated)
      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['assignments'], data)
    },
  })
}
