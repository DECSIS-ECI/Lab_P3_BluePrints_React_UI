import api from '../apiClient.js'

const apiclient = {
  async getAll() {
    const response = await api.get('/v1/blueprints')
    return response.data.data || []
  },

  async getByAuthor(author) {
    const response = await api.get(`/v1/blueprints/${author}`)
    return response.data.data || []
  },

  async getByAuthorAndName(author, name) {
    const response = await api.get(`/v1/blueprints/${author}/${name}`)
    return response.data.data
  },

  async create(blueprint) {
    const response = await api.post('/v1/blueprints', blueprint)
    return response.data.data || blueprint
  },

  // Agrega un único punto a un blueprint existente
  // PUT /blueprints/{author}/{bpname}/points → body: { x, y }
  async addPoint(author, bpname, point) {
    const response = await api.put(`/v1/blueprints/${author}/${bpname}/points`, point)
    return response.data
  },
}

export default apiclient
