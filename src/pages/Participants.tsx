import { type FormEvent, useState } from 'react'
import { useParticipants, useAddParticipant, useRemoveParticipant } from '../hooks/useSupabase'
import { usePermissions } from '../hooks/usePermissions'

export default function Participants() {
  const { can } = usePermissions()
  const canAdd = can('participants:add')
  const canRemove = can('participants:remove')
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const { data: participants = [], isLoading } = useParticipants()
  const addParticipant = useAddParticipant()
  const removeParticipant = useRemoveParticipant()

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addParticipant.mutate(trimmed, {
      onSuccess: () => setNewName(''),
    })
  }

  const handleRemove = (name: string) => {
    if (window.confirm(`¿Eliminar a "${name}" de la lista y de todas las asignaciones?`)) {
      removeParticipant.mutate(name)
    }
  }

  const filtered = participants
    .filter((p) => p.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es'))

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Participantes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona la lista de publicadores disponibles</p>
      </div>

      {canAdd && (
        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del participante"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
          />
          <button
            type="submit"
            disabled={!newName.trim() || addParticipant.isPending}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Agregar
          </button>
        </form>
      )}

      {canAdd && addParticipant.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          {addParticipant.error.message}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar participante..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filtered.length} participante{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            {search ? 'No se encontraron resultados' : 'No hay participantes registrados'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((name) => (
              <li key={name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <span className="text-gray-800 dark:text-gray-200">{name}</span>
                {canRemove && (
                  <button
                    onClick={() => handleRemove(name)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
