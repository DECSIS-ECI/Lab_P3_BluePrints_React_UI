import { describe, it, expect } from 'vitest'
import reducer, {
  updateBlueprint,
  deleteBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

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

  it('should apply optimistic update and rollback on update failure', () => {
    const base = {
      ...reducer(undefined, { type: '@@INIT' }),
      byAuthor: {
        john: [{ author: 'john', name: 'house', points: [{ x: 1, y: 1 }] }],
      },
      current: { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] },
    }

    const requestId = 'req-update-1'
    const pending = updateBlueprint.pending(requestId, {
      author: 'john',
      name: 'house',
      blueprint: { author: 'john', name: 'house', points: [{ x: 2, y: 2 }] },
    })

    const optimisticState = reducer(base, pending)
    expect(optimisticState.byAuthor.john[0].points).toEqual([{ x: 2, y: 2 }])
    expect(optimisticState.current.points).toEqual([{ x: 2, y: 2 }])

    const rejected = updateBlueprint.rejected(
      new Error('failed'),
      requestId,
      {
        author: 'john',
        name: 'house',
        blueprint: { author: 'john', name: 'house', points: [{ x: 2, y: 2 }] },
      },
      'Error al actualizar blueprint',
    )

    const rolledBackState = reducer(optimisticState, rejected)
    expect(rolledBackState.byAuthor.john[0].points).toEqual([{ x: 1, y: 1 }])
    expect(rolledBackState.current.points).toEqual([{ x: 1, y: 1 }])
  })

  it('should apply optimistic delete and rollback on delete failure', () => {
    const base = {
      ...reducer(undefined, { type: '@@INIT' }),
      byAuthor: {
        john: [
          { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] },
          { author: 'john', name: 'tree', points: [{ x: 4, y: 4 }] },
        ],
      },
      current: { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] },
    }

    const requestId = 'req-delete-1'
    const pending = deleteBlueprint.pending(requestId, {
      author: 'john',
      name: 'house',
    })

    const optimisticState = reducer(base, pending)
    expect(optimisticState.byAuthor.john).toHaveLength(1)
    expect(optimisticState.byAuthor.john[0].name).toBe('tree')
    expect(optimisticState.current).toBe(null)

    const rejected = deleteBlueprint.rejected(
      new Error('failed'),
      requestId,
      { author: 'john', name: 'house' },
      'Error al eliminar blueprint',
    )

    const rolledBackState = reducer(optimisticState, rejected)
    expect(rolledBackState.byAuthor.john).toHaveLength(2)
    expect(rolledBackState.byAuthor.john[0].name).toBe('house')
    expect(rolledBackState.current?.name).toBe('house')
  })
})
