import { useState } from 'react'
import InteractiveCanvas from './InteractiveCanvas.jsx'

export default function BlueprintForm({ onSubmit }) {
  const [author, setAuthor] = useState('')
  const [name, setName] = useState('')
  const [points, setPoints] = useState([{ x: 10, y: 10 }, { x: 40, y: 60 }])
  const [pointsInput, setPointsInput] = useState(JSON.stringify(points))
  const [error, setError] = useState('')

  // Sincroniza input editable con puntos
  useState(() => {
    setPointsInput(JSON.stringify(points))
  }, [points])

  const handle = (e) => {
    e.preventDefault()
    let parsedPoints = points
    if (pointsInput !== JSON.stringify(points)) {
      try {
        parsedPoints = JSON.parse(pointsInput)
        setError('')
      } catch {
        setError('Formato de puntos inválido (JSON)')
        return
      }
    }
    onSubmit({ author, name, points: parsedPoints })
  }

  return (
    <form onSubmit={handle} className="card">
      <h3 style={{ marginTop: 0 }}>Crear Blueprint</h3>
      <div className="grid cols-2">
        <div>
          <label>Autor</label>
            <input
              className="form-control"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="juan.perez"
            />
        </div>
        <div>
          <label>Nombre</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mi-dibujo"
            />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Lienzo: haz click para agregar puntos</label>
        <InteractiveCanvas points={points} setPoints={setPoints} />
      </div>
      <div className="mb-3">
        <label className="form-label">Puntos (JSON)</label>
        <input
          className="form-control"
          rows="5"
          value={pointsInput}
          onChange={e => setPointsInput(e.target.value)}
          placeholder="Puntos JSON"
        />
        {error && <div style={{ color: '#f87171', fontWeight: 600, marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  )
}
