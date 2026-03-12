import { useRef, useEffect } from 'react'

export default function InteractiveCanvas({ points, setPoints, width = 520, height = 360, darkMode, deleteMode = false }) {
  const ref = useRef(null)

  // Dibuja igual que BlueprintCanvas
  function draw() {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    if (points.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = '#fbbf24'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Redibuja cada vez que cambian los puntos
  useEffect(draw, [points])

  function handleClick(e) {
    const rect = ref.current.getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) * (ref.current.width / rect.width))
    const y = Math.round((e.clientY - rect.top) * (ref.current.height / rect.height))
    
    if (deleteMode) {
      // Buscar el punto más cercano al click
      let closestIndex = -1
      let closestDistance = 15 // Radio de detección
      
      for (let i = 0; i < points.length; i++) {
        const dx = points[i].x - x
        const dy = points[i].y - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = i
        }
      }
      
      // Si encontramos un punto cercano, borrarlo
      if (closestIndex !== -1) {
        setPoints(points.filter((_, i) => i !== closestIndex))
      }
    } else {
      // Modo agregar puntos
      setPoints([...points, { x, y }])
    }
  }

  return (
    <div
      className={darkMode ? 'bg-dark' : ''}
      style={{
        width: '100%',
        aspectRatio: `${width} / ${height}`,
        maxWidth: 520,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas
        ref={ref}
        width={width}
        height={height}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: deleteMode ? 'pointer' : 'crosshair',
        }}
        onClick={handleClick}
      />
    </div>
  )
}
