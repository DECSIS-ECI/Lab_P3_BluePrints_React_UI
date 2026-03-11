import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  updateBlueprint,
  deleteBlueprint,
  clearError,
} from '../features/blueprints/blueprintsSlice.js'
import InteractiveCanvas from '../components/InteractiveCanvas.jsx'

export default function BlueprintsPage({ darkMode }) {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [authError, setAuthError] = useState(null)
  const [editPoints, setEditPoints] = useState([])
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState('')
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
        globalThis.location.href = '/login'
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
    setSaved(false)
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  // Cuando cambia el plano actual, sincroniza los puntos editables
  useEffect(() => {
    if (current?.points) {
      setEditPoints([...current.points])
    } else {
      setEditPoints([])
    }
    setSaved(false)
    setSaveError(null)
  }, [current])

  const handleSave = async () => {
    if (!current) {
      return
    }

    if (JSON.stringify(current.points || []) === JSON.stringify(editPoints)) {
      setSaved(true)
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaved(false)
    setDeleteSuccess('')

    try {
      await dispatch(
        updateBlueprint({
          author: current.author,
          name: current.name,
          blueprint: {
            author: current.author,
            name: current.name,
            points: editPoints,
          },
        }),
      ).unwrap()
      setSaved(true)
    } catch (err) {
      setSaveError(err || 'Error al actualizar el blueprint. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bp) => {
    const confirmed = globalThis.confirm(`Deseas eliminar el blueprint ${bp.name}?`)
    if (!confirmed) return

    setDeleteSuccess('')
    setSaved(false)
    setSaveError(null)

    try {
      await dispatch(deleteBlueprint({ author: bp.author, name: bp.name })).unwrap()
      setDeleteSuccess(`Blueprint ${bp.name} eliminado correctamente`)
    } catch (err) {
      setSaveError(err || 'Error al eliminar el blueprint. Intenta de nuevo.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      getBlueprints()
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`}>
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
              onKeyDown={handleKeyDown}
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

        <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`}>
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          
          {/* Mostrar errores generales */}
          {error && !authError && (
            <div style={{
              background:'#fee2e2',
              border:'1px solid #fecaca',
              color:'#b91c1c',
              padding:'0.75rem',
              borderRadius:'4px',
              marginBottom:'1rem',
              display:'flex',
              alignItems:'center',
              gap:12
            }}>
              <span style={{ flex:1 }}>{error}</span>
              <button className="btn btn-danger" onClick={getBlueprints} disabled={status==='loading'}>
                Reintentar
              </button>
            </div>
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
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.name}>
                      <td>{bp.name}</td>
                      <td className="text-end">{bp.points?.length || 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-success btn-lg shadow"
                            onClick={() => openBlueprint(bp)}
                            disabled={status === 'loading'}
                          >
                            Open
                          </button>
                          <button
                            className="btn btn-outline-primary btn-lg"
                            onClick={() => openBlueprint(bp)}
                            disabled={status === 'loading'}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-lg"
                            onClick={() => handleDelete(bp)}
                            disabled={status === 'loading'}
                          >
                            Delete
                          </button>
                        </div>
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

      <section className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ marginTop: 0 }}>Current blueprint: {current?.name || '—'}</h3>

        {!current ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Selecciona un plano</p>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Haz click en el lienzo para agregar puntos</p>.
            <InteractiveCanvas points={editPoints} setPoints={(pts) => { setEditPoints(pts); setSaved(false) }} darkMode={darkMode} />
            <div>
              <label htmlFor="points-json" style={{ fontWeight: 600, fontSize: 13 }}>Puntos (JSON)</label>
              <textarea
                id="points-json"
                className="form-control"
                rows="4"
                readOnly
                value={JSON.stringify(editPoints)}
                style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 4 }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <p style={{ color: '#22c55e', fontWeight: 600, margin: 0 }}>Blueprint actualizado correctamente</p>
            )}
            {deleteSuccess && (
              <p style={{ color: '#22c55e', fontWeight: 600, margin: 0 }}>{deleteSuccess}</p>
            )}
            {saveError && (
              <p style={{ color: '#f87171', fontWeight: 600, margin: 0 }}>{saveError}</p>
            )}
          </>
        )}
      </section>
    </div>
  )
}