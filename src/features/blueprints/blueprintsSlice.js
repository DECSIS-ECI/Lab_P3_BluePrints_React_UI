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
      setPlanoActual(state, action) {
        state.planoActual = action.payload;
      },
    clearError: (state) => {
      state.error = null
    },
    clearCurrent: (state) => {
      state.current = null
    }
  },
    // Estado inicial del slice
    initialState: {
      planoActual: null, // Nombre del plano actual
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null
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