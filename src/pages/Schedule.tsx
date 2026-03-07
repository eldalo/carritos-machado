import { useState, useMemo } from 'react'
import { DAYS, TIME_SLOTS, getSlotKey } from '../data/scheduleData'
import type { Assignments } from '../data/scheduleData'
import { useAssignments, useUpdateAssignment, useBlockedSlots, useParticipants } from '../hooks/useSupabase'
import { usePermissions } from '../hooks/usePermissions'
import { useSelectedPoint } from '../hooks/useSelectedPoint'
import PointSelector from '../components/PointSelector'

const MAX_PER_SLOT = 2

interface EditingSlot {
  key: string
  dayId: string
  dayLabel: string
  timeLabel: string
  assigned: string[]
}

interface AssignmentModalProps {
  dayLabel: string
  timeLabel: string
  currentAssigned: string[]
  participants: string[]
  busyInDay: Set<string>
  onClose: () => void
  onSave: (selected: string[]) => void
}

function AssignmentModal({ dayLabel, timeLabel, currentAssigned, participants, busyInDay, onClose, onSave }: AssignmentModalProps) {
  const [selected, setSelected] = useState<string[]>(currentAssigned)
  const [search, setSearch] = useState('')

  const isFull = selected.length >= MAX_PER_SLOT

  const toggleParticipant = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const filtered = participants.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{dayLabel}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{timeLabel}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {selected.length}/{MAX_PER_SLOT} seleccionados
          </p>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar participante..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {filtered.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">Sin resultados</p>
          ) : (
            <ul className="space-y-1">
              {filtered.sort((a, b) => a.localeCompare(b, 'es')).map((name) => {
                const isSelected = selected.includes(name)
                const isBusy = busyInDay.has(name) && !isSelected
                const isDisabled = (!isSelected && isFull) || isBusy

                return (
                  <li key={name}>
                    <label
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => toggleParticipant(name)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{name}</span>
                      {isBusy && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                          Ya asignado hoy
                        </span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(selected); onClose() }}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function getBusyParticipantsForDay(dayId: string, excludeSlotKey: string, assignments: Assignments): Set<string> {
  const busy = new Set<string>()
  for (const slot of TIME_SLOTS) {
    const key = getSlotKey(dayId, slot.id)
    if (key === excludeSlotKey) continue
    const names = assignments[key]
    if (names) {
      for (const n of names) {
        busy.add(n)
      }
    }
  }
  return busy
}

export default function Schedule() {
  const { selectedPointId, setSelectedPointId, points, isLoadingPoints } = useSelectedPoint()
  const { can } = usePermissions()
  const canEdit = can('schedule:edit')
  const { data: assignments = {} } = useAssignments(selectedPointId)
  const { data: blockedSlots = {} } = useBlockedSlots(selectedPointId)
  const { data: participants = [] } = useParticipants()
  const updateAssignment = useUpdateAssignment(selectedPointId)
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null)

  const busyInDay = useMemo(() => {
    if (!editingSlot) return new Set<string>()
    return getBusyParticipantsForDay(editingSlot.dayId, editingSlot.key, assignments)
  }, [editingSlot, assignments])

  const handleCellClick = (dayId: string, timeSlotId: string) => {
    if (!canEdit) return
    const key = getSlotKey(dayId, timeSlotId)
    if (blockedSlots[key]) return
    const day = DAYS.find((d) => d.id === dayId)
    const time = TIME_SLOTS.find((t) => t.id === timeSlotId)
    if (!day || !time) return
    setEditingSlot({
      key,
      dayId,
      dayLabel: day.label,
      timeLabel: time.label,
      assigned: assignments[key] || [],
    })
  }

  const handleSave = (selected: string[]) => {
    if (!editingSlot) return
    updateAssignment.mutate({ slotKey: editingSlot.key, participants: selected })
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Horarios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {canEdit ? 'Asigna participantes a los turnos disponibles' : 'Vista de los turnos asignados'}
          </p>
        </div>
        <PointSelector
          points={points}
          selectedPointId={selectedPointId}
          onChange={setSelectedPointId}
          isLoading={isLoadingPoints}
        />
      </div>

      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-primary-600 text-white">
              <th className="px-3 py-3 text-left text-sm font-semibold border-r border-primary-500 w-32">Horario</th>
              {DAYS.map((day) => (
                <th key={day.id} className="px-3 py-3 text-center text-sm font-semibold border-r border-primary-500 last:border-r-0">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, rowIdx) => (
              <tr key={slot.id} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                <td className="px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {slot.label}
                </td>
                {DAYS.map((day) => {
                  const key = getSlotKey(day.id, slot.id)
                  const isBlocked = !!blockedSlots[key]
                  const blockInfo = blockedSlots[key]
                  const assigned = assignments[key] || []

                  return (
                    <td
                      key={day.id}
                      onClick={() => handleCellClick(day.id, slot.id)}
                      className={`px-2 py-2 text-xs border-r border-gray-200 dark:border-gray-700 last:border-r-0 align-top min-w-[120px] ${
                        isBlocked
                          ? 'bg-primary-100 dark:bg-primary-900/40 cursor-not-allowed'
                          : canEdit
                            ? 'hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer transition'
                            : ''
                      }`}
                    >
                      {isBlocked ? (
                        <div className="text-center">
                          {blockInfo.reason && (
                            <span className="text-primary-700 dark:text-primary-300 font-medium italic text-[11px] leading-tight block">
                              {blockInfo.reason}
                            </span>
                          )}
                          {!blockInfo.reason && (
                            <span className="text-primary-400 dark:text-primary-500 text-[11px]">Bloqueado</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {assigned.length > 0 ? (
                            assigned.map((name) => (
                              <div key={name} className="text-gray-700 dark:text-gray-300 leading-tight">{name}</div>
                            ))
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600 italic">Vacío</span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSlot && (
        <AssignmentModal
          dayLabel={editingSlot.dayLabel}
          timeLabel={editingSlot.timeLabel}
          currentAssigned={editingSlot.assigned}
          participants={participants}
          busyInDay={busyInDay}
          onClose={() => setEditingSlot(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
