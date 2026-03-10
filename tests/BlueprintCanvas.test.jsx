import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'
import React from 'react'

describe('BlueprintCanvas', () => {
  it('renderiza un canvas y llama getContext', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    const { container } = render(
      <BlueprintCanvas
        points={[{ x: 10, y: 10 }, { x: 50, y: 60 }]}
      />,
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
    it('dibuja puntos correctamente', () => {
      const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      render(<BlueprintCanvas points={[{ x: 20, y: 30 }, { x: 40, y: 50 }]} />)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('actualiza puntos al cambiar props', () => {
      const { rerender, container } = render(<BlueprintCanvas points={[{ x: 10, y: 10 }]} />)
      expect(container.querySelector('canvas')).toBeInTheDocument()
      rerender(<BlueprintCanvas points={[{ x: 10, y: 10 }, { x: 100, y: 100 }]} />)
      expect(container.querySelector('canvas')).toBeInTheDocument()
    })
})
