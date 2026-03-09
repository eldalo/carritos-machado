import { useState, useEffect } from 'react'
import { DAYS, TIME_SLOTS, getSlotKey } from '../data/scheduleData'
import { useAssignments, useBlockedSlots, usePoints } from '../hooks/useSupabase'
import { useTheme } from '../context/ThemeContext'

export default function PublicSchedule() {
  const { data: points = [], isLoading: loadingPoints } = usePoints()
  const [selectedPointId, setSelectedPointId] = useState<string>('')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!selectedPointId && points.length > 0) {
      setSelectedPointId(points[0].id)
    }
  }, [points, selectedPointId])

  const { data: assignments = {} } = useAssignments(selectedPointId)
  const { data: blockedSlots = {} } = useBlockedSlots(selectedPointId)

  const selectedPoint = points.find((p) => p.id === selectedPointId)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header mínimo */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">Carritos Machado</span>
            </div>
            <div className="flex items-center gap-2">
              {!loadingPoints && points.length > 1 && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    value={selectedPointId}
                    onChange={(e) => setSelectedPointId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
                  >
                    {points.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Horarios {selectedPoint ? `— ${selectedPoint.name}` : ''}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">Consulta los turnos asignados</p>
        </div>

        {loadingPoints ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : points.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No hay puntos configurados</div>
        ) : (
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
                          className={`px-2 py-2 text-xs border-r border-gray-200 dark:border-gray-700 last:border-r-0 align-top min-w-[120px] ${
                            isBlocked ? 'bg-primary-100 dark:bg-primary-900/40' : ''
                          }`}
                        >
                          {isBlocked ? (
                            <div className="text-center">
                              {blockInfo.reason ? (
                                <span className="text-primary-700 dark:text-primary-300 font-medium italic text-[11px] leading-tight block">
                                  {blockInfo.reason}
                                </span>
                              ) : (
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
        )}
      </main>
    </div>
  )
}
