import api from '../apiClient.js'

const apiclient = {
  async getAll() {
    const response = await api.get('/api/v1/blueprints')
    return response.data.data || []
  },

  async getByAuthor(author) {
    const response = await api.get(`/api/v1/blueprints/${author}`)
    return response.data.data || []
  },

  async getByAuthorAndName(author, name) {
    const response = await api.get(`/api/v1/blueprints/${author}/${name}`)
    return response.data.data
  },

  async create(blueprint) {
    const response = await api.post('/api/v1/blueprints', blueprint)
    return response.data.data || blueprint
  },
}

export default apiclient
