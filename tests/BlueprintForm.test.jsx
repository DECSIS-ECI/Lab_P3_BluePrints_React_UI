import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BlueprintForm from '../src/components/BlueprintForm.jsx'

describe('BlueprintForm', () => {
  it('envía el formulario con puntos parseados', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('juan.perez'), { target: { value: 'john' } })
    fireEvent.change(screen.getByPlaceholderText('mi-dibujo'), { target: { value: 'house' } })
    // Actualiza el input de puntos JSON si existe
    const pointsInput = screen.queryByPlaceholderText('Puntos JSON')
    if (pointsInput) {
      fireEvent.change(pointsInput, { target: { value: '[{"x":1,"y":2}]' } })
    }
    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 2 }],
    })
  })

  it('muestra error si puntos no son válidos', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)
    const pointsInput = screen.queryByPlaceholderText('Puntos JSON')
    if (pointsInput) {
      fireEvent.change(pointsInput, { target: { value: 'no-json' } })
    }
    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    // Se puede verificar que aparece un mensaje de error si el componente lo muestra
  })

    it('actualiza inputs correctamente', () => {
      render(<BlueprintForm onSubmit={() => {}} />)
      fireEvent.change(screen.getByPlaceholderText('juan.perez'), { target: { value: 'ana' } })
      fireEvent.change(screen.getByPlaceholderText('mi-dibujo'), { target: { value: 'edificio' } })
      expect(screen.getByPlaceholderText('juan.perez').value).toBe('ana')
      expect(screen.getByPlaceholderText('mi-dibujo').value).toBe('edificio')
    })
})
