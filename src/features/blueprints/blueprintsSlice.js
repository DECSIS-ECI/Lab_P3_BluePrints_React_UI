import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

// Async thunks
export const fetchAuthors = createAsyncThunk(
  'blueprints/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      return await blueprintsService.getAll()
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Sesión expirada. Por favor inicia sesión nuevamente')
      }
      return rejectWithValue(error.response?.data?.message || 'Error al cargar autores')
    }
  }
)

export const fetchByAuthor = createAsyncThunk(
  'blueprints/fetchByAuthor',
  async (author, { rejectWithValue }) => {
    try {
      // Delay artificial para probar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      const blueprints = await blueprintsService.getByAuthor(author);
      return { author, blueprints };
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Sesión expirada. Por favor inicia sesión nuevamente');
      }
      if (error.response?.status === 404) {
        return rejectWithValue(`No se encontraron planos para el autor: ${author}`);
      }
      return rejectWithValue(error.response?.data?.message || 'Error al cargar blueprints');
    }
  }
);

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      return await blueprintsService.getByAuthorAndName(author, name)
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Sesión expirada. Por favor inicia sesión nuevamente')
      }
      if (error.response?.status === 404) {
        return rejectWithValue(`No se encontró el blueprint: ${name}`)
      }
      return rejectWithValue(error.response?.data?.message || 'Error al cargar blueprint')
    }
  }
)

export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async ({ author, name, blueprint }, { rejectWithValue }) => {
    try {
      return await blueprintsService.update(author, name, blueprint)
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Sesion expirada. Por favor inicia sesion nuevamente')
      }
      if (error.response?.status === 404) {
        return rejectWithValue(`No se encontro el blueprint: ${name}`)
      }
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar blueprint')
    }
  },
)

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      await blueprintsService.remove(author, name)
      return { author, name }
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Sesion expirada. Por favor inicia sesion nuevamente')
      }
      if (error.response?.status === 404) {
        return rejectWithValue(`No se encontro el blueprint: ${name}`)
      }
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar blueprint')
    }
  },
)

const replaceBlueprintInAuthorList = (state, blueprint, fallbackAuthor, fallbackName) => {
  const targetAuthor = fallbackAuthor || blueprint.author
  const list = state.byAuthor[targetAuthor]
  if (!Array.isArray(list)) return
  const index = list.findIndex((bp) => bp.name === (fallbackName || blueprint.name))
  if (index >= 0) {
    list[index] = blueprint
  }
}

// Slice
const blueprintsSlice = createSlice({
  name: 'blueprints',
  initialState: {
    planoActual: null,
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    optimistic: {
      updates: {},
      deletes: {},
    },
  },
  reducers: {
    setPlanoActual(state, action) {
      state.planoActual = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrent: (state) => {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAuthors
      .addCase(fetchAuthors.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.authors = action.payload
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // fetchByAuthor
      .addCase(fetchByAuthor.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { author, blueprints } = action.payload
        state.byAuthor[author] = blueprints
      })
      .addCase(fetchByAuthor.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      
      // fetchBlueprint
      .addCase(fetchBlueprint.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchBlueprint.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchBlueprint.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // updateBlueprint (optimistic)
      .addCase(updateBlueprint.pending, (state, action) => {
        state.status = 'loading'
        state.error = null

        const { author, name, blueprint } = action.meta.arg
        const list = state.byAuthor[author] || []
        const previousIndex = list.findIndex((bp) => bp.name === name)

        state.optimistic.updates[action.meta.requestId] = {
          author,
          name,
          previousByAuthorItem: previousIndex >= 0 ? list[previousIndex] : null,
          previousCurrent: state.current,
        }

        replaceBlueprintInAuthorList(state, blueprint, author, name)
        if (state.current?.author === author && state.current?.name === name) {
          state.current = blueprint
        }
      })
      .addCase(updateBlueprint.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { author, name } = action.meta.arg
        const updatedBlueprint = action.payload

        replaceBlueprintInAuthorList(state, updatedBlueprint, author, name)
        if (state.current?.author === author && state.current?.name === name) {
          state.current = updatedBlueprint
        }

        delete state.optimistic.updates[action.meta.requestId]
      })
      .addCase(updateBlueprint.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload

        const rollbackData = state.optimistic.updates[action.meta.requestId]
        if (rollbackData) {
          const { author, name, previousByAuthorItem, previousCurrent } = rollbackData
          if (previousByAuthorItem) {
            replaceBlueprintInAuthorList(state, previousByAuthorItem, author, name)
          }
          state.current = previousCurrent
          delete state.optimistic.updates[action.meta.requestId]
        }
      })

      // deleteBlueprint (optimistic)
      .addCase(deleteBlueprint.pending, (state, action) => {
        state.status = 'loading'
        state.error = null

        const { author, name } = action.meta.arg
        const list = state.byAuthor[author] || []
        const deleteIndex = list.findIndex((bp) => bp.name === name)
        const deletedItem = deleteIndex >= 0 ? list[deleteIndex] : null

        state.optimistic.deletes[action.meta.requestId] = {
          author,
          name,
          deleteIndex,
          deletedItem,
          previousCurrent: state.current,
        }

        if (deleteIndex >= 0) {
          list.splice(deleteIndex, 1)
        }
        if (state.current?.author === author && state.current?.name === name) {
          state.current = null
        }
      })
      .addCase(deleteBlueprint.fulfilled, (state, action) => {
        state.status = 'succeeded'
        delete state.optimistic.deletes[action.meta.requestId]

        if (state.planoActual === action.payload.name) {
          state.planoActual = null
        }
      })
      .addCase(deleteBlueprint.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload

        const rollbackData = state.optimistic.deletes[action.meta.requestId]
        if (rollbackData) {
          const { author, deleteIndex, deletedItem, previousCurrent } = rollbackData
          if (deletedItem) {
            const list = state.byAuthor[author] || []
            const safeIndex = deleteIndex >= 0 ? deleteIndex : list.length
            list.splice(safeIndex, 0, deletedItem)
            state.byAuthor[author] = list
          }
          state.current = previousCurrent
          delete state.optimistic.deletes[action.meta.requestId]
        }
      })
  }
})

export const { setPlanoActual, clearError, clearCurrent } = blueprintsSlice.actions
export default blueprintsSlice.reducer