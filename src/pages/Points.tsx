import { type FormEvent, useState } from 'react'
import { usePoints, useAddPoint, useUpdatePoint, useRemovePoint } from '../hooks/useSupabase'
import { usePermissions } from '../hooks/usePermissions'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import type { PointRow } from '../types/database'

interface PointFormModalProps {
  mode: 'add' | 'edit'
  initialName?: string
  initialDescription?: string
  onClose: () => void
  onSave: (name: string, description: string) => void
  isPending: boolean
}

function PointFormModal({ mode, initialName = '', initialDescription = '', onClose, onSave, isPending }: PointFormModalProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed, description.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Agregar Punto' : 'Editar Punto'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label htmlFor="point-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              id="point-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del punto"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="point-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción (opcional)
            </label>
            <input
              id="point-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Points() {
  const { can } = usePermissions()
  const canAdd = can('points:add')
  const canEdit = can('points:edit')
  const canRemove = can('points:remove')

  const { data: points = [], isLoading } = usePoints()
  const addPoint = useAddPoint()
  const updatePoint = useUpdatePoint()
  const removePoint = useRemovePoint()

  const { showToast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPoint, setEditingPoint] = useState<PointRow | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<PointRow | null>(null)

  const handleAdd = (name: string, description: string) => {
    addPoint.mutate({ name, description }, {
      onSuccess: () => {
        setShowAddModal(false)
        showToast('Punto agregado', 'success')
      },
      onError: (error) => {
        showToast(error.message, 'error')
      },
    })
  }

  const handleEdit = (name: string, description: string) => {
    if (!editingPoint) return
    updatePoint.mutate({ id: editingPoint.id, name, description }, {
      onSuccess: () => {
        setEditingPoint(null)
        showToast('Punto actualizado', 'success')
      },
      onError: (error) => {
        showToast(error.message, 'error')
      },
    })
  }

  const handleRemove = (point: PointRow) => {
    setConfirmingDelete(point)
  }

  const confirmDelete = () => {
    if (!confirmingDelete) return
    removePoint.mutate(confirmingDelete.id, {
      onSuccess: () => {
        showToast('Punto eliminado', 'success')
        setConfirmingDelete(null)
      },
      onError: () => {
        showToast('Hubo un error al eliminar el Punto', 'error')
        setConfirmingDelete(null)
      },
    })
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Puntos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold">Gestiona los puntos de exhibición</p>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {points.length} punto{points.length !== 1 ? 's' : ''}
          </span>
        </div>
        {points.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No hay puntos registrados
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {points.map((point) => (
              <li key={point.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="min-w-0 flex-1">
                  <div className="text-gray-800 dark:text-gray-200 font-medium">{point.name}</div>
                  {point.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{point.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3">
                  {canEdit && (
                    <button
                      onClick={() => setEditingPoint(point)}
                      className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1.5 rounded-lg transition"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {canRemove && (
                    <button
                      onClick={() => handleRemove(point)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddModal && (
        <PointFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          isPending={addPoint.isPending}
        />
      )}

      {editingPoint && (
        <PointFormModal
          mode="edit"
          initialName={editingPoint.name}
          initialDescription={editingPoint.description || ''}
          onClose={() => setEditingPoint(null)}
          onSave={handleEdit}
          isPending={updatePoint.isPending}
        />
      )}

      {confirmingDelete && (
        <ConfirmModal
          title="Eliminar punto"
          message={`¿Eliminar el punto "${confirmingDelete.name}"? Se eliminarán todos sus horarios y asignaciones.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(null)}
          isPending={removePoint.isPending}
        />
      )}
    </div>
  )
}
