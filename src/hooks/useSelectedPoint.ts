import { useState, useEffect } from 'react'
import { usePoints } from './useSupabase'

const STORAGE_KEY = 'cm_selected_point'

export function useSelectedPoint() {
  const { data: points = [], isLoading } = usePoints()
  const [selectedPointId, setSelectedPointId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })

  // Auto-seleccionar primer punto si no hay ninguno seleccionado
  useEffect(() => {
    if (!selectedPointId && points.length > 0) {
      setSelectedPointId(points[0].id)
    }
  }, [points, selectedPointId])

  // Validar que el punto seleccionado todavía exista
  useEffect(() => {
    if (selectedPointId && points.length > 0 && !points.find((p) => p.id === selectedPointId)) {
      setSelectedPointId(points[0].id)
    }
  }, [points, selectedPointId])

  // Persistir en localStorage
  useEffect(() => {
    if (selectedPointId) {
      localStorage.setItem(STORAGE_KEY, selectedPointId)
    }
  }, [selectedPointId])

  return {
    selectedPointId,
    setSelectedPointId,
    points,
    isLoadingPoints: isLoading,
  }
}
