import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  updateBlueprint,
  deleteBlueprint,
  clearError,
} from '../features/blueprints/blueprintsSlice.js';
import InteractiveCanvas from '../components/InteractiveCanvas.jsx';
import blueprintsService from '../services/blueprintsService.js';

export default function BlueprintsPage({ darkMode }) {
  const dispatch = useDispatch();
  const { byAuthor, current, status, error } = useSelector((s) => s.blueprints);
  const [authorInput, setAuthorInput] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [authError, setAuthError] = useState(null);
  const [editPoints, setEditPoints] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const items = byAuthor[selectedAuthor] || [];

  // Estado para crear blueprint
  const [createMode, setCreateMode] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

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

  useEffect(() => {
    if (createMode) {
      setEditPoints([]);
      setSaved(false);
      setSaveError(null);
      setDeleteMode(false);
      return;
    }
    if (current?.points) {
      setEditPoints([...current.points]);
    } else {
      setEditPoints([]);
    }
    setSaved(false);
    setSaveError(null);
    setDeleteMode(false);
  }, [current, createMode]);

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

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Nombre del autor"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'loading' || authError || createMode}
            />
            <button 
              className="btn primary" 
              onClick={getBlueprints}
              disabled={status === 'loading' || authError || createMode}
            >
              {status === 'loading' ? 'Buscando...' : 'Get blueprints'}
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                if (!authorInput.trim()) {
                  setCreateError('Ingrese el nombre del autor');
                  return;
                }
                setCreateError('');
                setCreateMode(true);
                setCreateName('');
                setCreateSuccess('');
                setEditPoints([]);
              }}
              disabled={createMode}
            >Crear</button>
          </div>
          {createError && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{createError}</div>}
          {createSuccess && <div style={{ color: '#22c55e', marginBottom: 8 }}>{createSuccess}</div>}


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
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'nowrap' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openBlueprint(bp)}
                            disabled={status === 'loading'}
                          >
                            Open
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openBlueprint(bp)}
                            disabled={status === 'loading'}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
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
        <h3 style={{ marginTop: 0 }}>
          {createMode ? 'Crear nuevo blueprint' : `Current blueprint: ${current?.name || '—'}`}
        </h3>

        {createMode ? (
          <>
            <input
              className="input"
              placeholder="Nombre del blueprint"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                {deleteMode ? 'Haz click en un punto para borrarlo' : 'Haz click en el lienzo para agregar puntos'}
              </p>
              <button
                className={`btn ${deleteMode ? 'btn-warning' : 'btn-secondary'}`}
                onClick={() => setDeleteMode(!deleteMode)}
              >
                {deleteMode ? 'Agregar puntos' : 'Borrar puntos'}
              </button>
            </div>
            {deleteMode && <p style={{ margin: 0, fontSize: 12, color: '#f59e0b', marginBottom: 8 }}>Tip: Acerca el cursor a un punto para seleccionarlo</p>}
            <InteractiveCanvas points={editPoints} setPoints={setEditPoints} darkMode={darkMode} deleteMode={deleteMode} />
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
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!createName.trim()) {
                  setCreateError('Ingrese el nombre del blueprint');
                  return;
                }
                setCreateError('');
                setCreateSaving(true);
                try {
                  await blueprintsService.create({
                    author: authorInput,
                    name: createName,
                    points: editPoints.length ? editPoints : [{ x: 0, y: 0 }],
                  });
                  setCreateSuccess('Blueprint creado correctamente');
                  setCreateMode(false);
                  setCreateName('');
                  setEditPoints([]);
                  setSelectedAuthor(authorInput);
                  dispatch(fetchByAuthor(authorInput));
                } catch (e) {
                  setCreateError('Error al guardar el blueprint');
                } finally {
                  setCreateSaving(false);
                }
              }}
              disabled={createSaving}
            >{createSaving ? 'Guardando...' : 'Guardar'}</button>
            {createError && <div style={{ color: '#b91c1c', marginTop: 8 }}>{createError}</div>}
            {createSuccess && <div style={{ color: '#22c55e', marginTop: 8 }}>{createSuccess}</div>}
          </>
        ) : !current ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Selecciona un plano</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                {deleteMode ? 'Haz click en un punto para borrarlo' : 'Haz click en el lienzo para agregar puntos'}
              </p>
              <button
                className={`btn ${deleteMode ? 'btn-warning' : 'btn-secondary'}`}
                onClick={() => setDeleteMode(!deleteMode)}
              >
                {deleteMode ? 'Agregar puntos' : 'Borrar puntos'}
              </button>
            </div>
            {deleteMode && <p style={{ margin: 0, fontSize: 12, color: '#f59e0b', marginBottom: 8 }}>Tip: Acerca el cursor a un punto para seleccionarlo</p>}
            <InteractiveCanvas points={editPoints} setPoints={(pts) => { setEditPoints(pts); setSaved(false) }} darkMode={darkMode} deleteMode={deleteMode} />
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
