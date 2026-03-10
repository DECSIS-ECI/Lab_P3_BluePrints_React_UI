import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360, darkMode }) {
  const ref = useRef(null)

  useEffect(() => {
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
  }, [points])

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
          }}
        />
      </div>
  )
}
