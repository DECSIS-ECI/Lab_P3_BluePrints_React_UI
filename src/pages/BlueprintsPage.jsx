import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  clearError,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [authError, setAuthError] = useState(null)
  const items = byAuthor[selectedAuthor] || []

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  // Manejar errores de autenticación
  useEffect(() => {
    if (error?.includes('sesión') || error?.includes('Sesión')) {
      setAuthError('Sesión expirada. Serás redirigido al login...')
      
      // Redirigir después de 2 segundos
      const timer = setTimeout(() => {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [error])

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    if (!authorInput.trim()) {
      alert('Por favor ingresa un nombre de autor')
      return
    }
    setAuthError(null)
    dispatch(clearError())
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getBlueprints()
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          
          {/* Mostrar error de autenticación si existe */}
          {authError && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {authError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={status === 'loading' || authError}
            />
            <button 
              className="btn primary" 
              onClick={getBlueprints}
              disabled={status === 'loading' || authError}
            >
              {status === 'loading' ? 'Buscando...' : 'Get blueprints'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          
          {/* Mostrar errores generales */}
          {error && !authError && (
            <p style={{ color: '#f87171' }}>{error}</p>
          )}
          
          {status === 'loading' && <p>Cargando...</p>}
          
          {!items.length && status !== 'loading' && !error && (
            <p>Sin resultados.</p>
          )}
          
          {!!items.length && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-striped table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Blueprint name</th>
                    <th className="text-end">Number of points</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.name}>
                      <td>{bp.name}</td>
                      <td className="text-end">{bp.points?.length || 0}</td>
                      <td>
                        <button 
                          className="btn btn-success btn-lg shadow" 
                          onClick={() => openBlueprint(bp)}
                          disabled={status === 'loading'}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Current blueprint: {current?.name || '—'}</h3>
        <BlueprintCanvas points={current?.points || []} />
      </section>
    </div>
  )
}