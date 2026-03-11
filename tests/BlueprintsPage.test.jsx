import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'
import React from 'react'

// Mock de thunks del slice para no requerir backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
  updateBlueprint: (payload) => ({ type: 'blueprints/updateBlueprint', payload }),
  deleteBlueprint: (payload) => ({ type: 'blueprints/deleteBlueprint', payload }),
  clearError: () => ({ type: 'blueprints/clearError' }),
}))

function makeStore(preloaded) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
      ...preloaded,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('despacha fetchByAuthor al hacer click en Get blueprints', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'JohnConnor' })
  })

    it('muestra banner de error y botón Reintentar', () => {
      const store = makeStore({ error: 'Error de red' })
      render(
        <Provider store={store}>
          <BlueprintsPage />
        </Provider>,
      )
      expect(screen.getByText('Error de red')).toBeInTheDocument()
      const retryBtn = screen.getByRole('button', { name: /Reintentar/i })
      expect(retryBtn).toBeInTheDocument()
      expect(retryBtn).not.toBeDisabled()
    })


})
