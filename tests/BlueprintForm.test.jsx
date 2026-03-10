import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BlueprintForm from '../src/components/BlueprintForm.jsx'

describe('BlueprintForm', () => {
  it('envía el formulario con puntos parseados', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('juan.perez'), { target: { value: 'john' } })
    fireEvent.change(screen.getByPlaceholderText('mi-dibujo'), { target: { value: 'house' } })
    fireEvent.change(screen.getAllByRole('textbox')[2], {
      target: { value: '[{"x":1,"y":2}]' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 2 }],
    })
  })
})
