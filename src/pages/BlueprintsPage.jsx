import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  clearError,
} from '../features/blueprints/blueprintsSlice.js'
import InteractiveCanvas from '../components/InteractiveCanvas.jsx'
import blueprintsService from '../services/blueprintsService.js'

export default function BlueprintsPage({ darkMode }) {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [authError, setAuthError] = useState(null)
  const [editPoints, setEditPoints] = useState([])
  const [originalPointsCount, setOriginalPointsCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
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
    setSaved(false)
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  // Cuando cambia el plano actual, sincroniza los puntos editables
  useEffect(() => {
    if (current?.points) {
      setEditPoints([...current.points])
      setOriginalPointsCount(current.points.length)
    } else {
      setEditPoints([])
      setOriginalPointsCount(0)
    }
    setSaved(false)
    setSaveError(null)
  }, [current])

  const handleSave = async () => {
    // Solo enviar los puntos nuevos (agregados con click)
    const newPoints = editPoints.slice(originalPointsCount)
    if (!newPoints.length) {
      setSaved(true)
      return
    }
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      for (const point of newPoints) {
        await blueprintsService.addPoint(current.author, current.name, point)
      }
      setSaved(true)
    } catch (err) {
      const status = err.response?.status
      if (status === 404) {
        setSaveError('Blueprint no encontrado en el servidor.')
      } else if (status === 400) {
        setSaveError('Datos inválidos. Verifica los puntos ingresados.')
      } else if (status === 401) {
        setSaveError('No tienes autorización para modificar este blueprint.')
      } else {
        setSaveError('Error al guardar. Intenta de nuevo.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e) => {
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

      <section className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ marginTop: 0 }}>Current blueprint: {current?.name || '—'}</h3>

        {!current ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Selecciona un plano</p>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Haz click en el lienzo para agregar puntos</p>.
            <InteractiveCanvas points={editPoints} setPoints={(pts) => { setEditPoints(pts); setSaved(false) }} darkMode={darkMode} />
            <div>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Puntos (JSON)</label>
              <textarea
                className="form-control"
                rows="4"
                readOnly
                value={JSON.stringify(editPoints)}
                style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 4 }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            {saved && (
              <p style={{ color: '#22c55e', fontWeight: 600, margin: 0 }}>Plano actualizado correctamente</p>
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