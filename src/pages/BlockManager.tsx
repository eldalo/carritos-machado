import { useState } from 'react'
import { DAYS, TIME_SLOTS, BLOCK_REASONS, getSlotKey } from '../data/scheduleData'
import { useBlockedSlots, useToggleBlock } from '../hooks/useSupabase'
import { useSelectedPoint } from '../hooks/useSelectedPoint'
import PointSelector from '../components/PointSelector'

interface BlockingSlot {
  key: string
  dayLabel: string
  timeLabel: string
}

interface ReasonModalProps {
  dayLabel: string
  timeLabel: string
  currentReason: string
  onClose: () => void
  onSave: (reason: string) => void
}

function ReasonModal({ dayLabel, timeLabel, currentReason, onClose, onSave }: ReasonModalProps) {
  const [reason, setReason] = useState(currentReason || '')
  const [customReason, setCustomReason] = useState(
    BLOCK_REASONS.includes(currentReason) ? '' : currentReason || ''
  )
  const [useCustom, setUseCustom] = useState(
    !!currentReason && !BLOCK_REASONS.includes(currentReason)
  )

  const handleSave = () => {
    onSave(useCustom ? customReason : reason)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Bloquear horario</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dayLabel} - {timeLabel}</p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Razón del bloqueo (opcional):</p>
          {BLOCK_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                checked={!useCustom && reason === r}
                onChange={() => { setReason(r); setUseCustom(false) }}
                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{r}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="reason"
              checked={!useCustom && reason === ''}
              onChange={() => { setReason(''); setUseCustom(false) }}
              className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Sin razón</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="reason"
              checked={useCustom}
              onChange={() => setUseCustom(true)}
              className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Personalizado</span>
          </label>
          {useCustom && (
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Escribe la razón..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
              autoFocus
            />
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            Bloquear
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BlockManager() {
  const { selectedPointId, setSelectedPointId, points, isLoadingPoints } = useSelectedPoint()
  const { data: blockedSlots = {} } = useBlockedSlots(selectedPointId)
  const toggleBlock = useToggleBlock(selectedPointId)
  const [blockingSlot, setBlockingSlot] = useState<BlockingSlot | null>(null)

  const handleCellClick = (dayId: string, timeSlotId: string) => {
    const key = getSlotKey(dayId, timeSlotId)
    if (blockedSlots[key]) {
      toggleBlock.mutate({ slotKey: key })
    } else {
      const day = DAYS.find((d) => d.id === dayId)
      const time = TIME_SLOTS.find((t) => t.id === timeSlotId)
      if (!day || !time) return
      setBlockingSlot({ key, dayLabel: day.label, timeLabel: time.label })
    }
  }

  const handleBlock = (reason: string) => {
    if (!blockingSlot) return
    toggleBlock.mutate({ slotKey: blockingSlot.key, reason })
  }

  const blockedCount = Object.keys(blockedSlots).length
  const totalSlots = DAYS.length * TIME_SLOTS.length

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Bloques</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">
            Selecciona los horarios que deseas bloquear.
          </p>
          <div className="mt-3 flex gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-primary-200 dark:bg-primary-800 border border-primary-300 dark:border-primary-600 inline-block" />
              Bloqueado ({blockedCount})
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 inline-block" />
              Disponible ({totalSlots - blockedCount})
            </span>
          </div>
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
            <tr className="bg-gray-800 text-white">
              <th className="px-3 py-3 text-left text-sm font-semibold border-r border-gray-700 w-32">Horario</th>
              {DAYS.map((day) => (
                <th key={day.id} className="px-3 py-3 text-center text-sm font-semibold border-r border-gray-700 last:border-r-0">
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

                  return (
                    <td
                      key={day.id}
                      onClick={() => handleCellClick(day.id, slot.id)}
                      className={`px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer transition min-w-[120px] ${
                        isBlocked
                          ? 'bg-primary-200 dark:bg-primary-800 hover:bg-primary-300 dark:hover:bg-primary-700'
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {isBlocked ? (
                        <div>
                          <svg className="w-5 h-5 text-primary-700 dark:text-primary-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {blockInfo?.reason && (
                            <span className="text-[10px] text-primary-700 dark:text-primary-300 mt-1 block leading-tight">{blockInfo.reason}</span>
                          )}
                        </div>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blockingSlot && (
        <ReasonModal
          dayLabel={blockingSlot.dayLabel}
          timeLabel={blockingSlot.timeLabel}
          currentReason=""
          onClose={() => setBlockingSlot(null)}
          onSave={handleBlock}
        />
      )}
    </div>
  )
}
