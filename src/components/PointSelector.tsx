import type { PointRow } from '../types/database'

interface PointSelectorProps {
  points: PointRow[]
  selectedPointId: string
  onChange: (pointId: string) => void
  isLoading?: boolean
}

export default function PointSelector({ points, selectedPointId, onChange, isLoading }: PointSelectorProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    )
  }

  if (points.length === 0) {
    return (
      <span className="text-sm text-gray-400 dark:text-gray-500 italic">Sin puntos disponibles</span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <select
        value={selectedPointId}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
      >
        {points.map((point) => (
          <option key={point.id} value={point.id}>
            {point.name}
          </option>
        ))}
      </select>
    </div>
  )
}
