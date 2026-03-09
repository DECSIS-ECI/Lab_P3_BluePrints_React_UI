import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/apiClient'

// Async thunks
export const fetchAuthors = createAsyncThunk(
  'blueprints/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/blueprints')
      return response.data.data || []
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
      const response = await api.get(`/blueprints/${author}`)
      return { author, blueprints: response.data.data || [] }
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Sesión expirada. Por favor inicia sesión nuevamente')
      }
      if (error.response?.status === 404) {
        return rejectWithValue(`No se encontraron planos para el autor: ${author}`)
      }
      return rejectWithValue(error.response?.data?.message || 'Error al cargar blueprints')
    }
  }
)

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/blueprints/${author}/${name}`)
      return response.data.data
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

// Slice
const blueprintsSlice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrent: (state) => {
      state.current = null
    }
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
  }
})

export const { clearError, clearCurrent } = blueprintsSlice.actions
export default blueprintsSlice.reducer