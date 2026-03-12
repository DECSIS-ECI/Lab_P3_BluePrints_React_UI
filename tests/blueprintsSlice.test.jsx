import { describe, it, expect } from 'vitest'
import reducer from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('should initialize correctly', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.authors).toEqual([])
  })
  it('should clear error', () => {
    const prev = { ...reducer(undefined, { type: '@@INIT' }), error: 'Algo salió mal' }
    const state = reducer(prev, { type: 'blueprints/clearError' })
    expect(state.error).toBe(null)
  })
  it('should clear current', () => {
    const prev = { ...reducer(undefined, { type: '@@INIT' }), current: { name: 'Casa', points: [] } }
    const state = reducer(prev, { type: 'blueprints/clearCurrent' })
    expect(state.current).toBe(null)
  })
  it('should set planoActual', () => {
    const prev = reducer(undefined, { type: '@@INIT' })
    const state = reducer(prev, { type: 'blueprints/setPlanoActual', payload: 'Casa' })
    expect(state.planoActual).toBe('Casa')
  })
})
