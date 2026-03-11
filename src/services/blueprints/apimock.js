const mockBlueprints = [
  {
    author: 'jhon',
    name: 'house',
    points: [
      { x: 10, y: 10 },
      { x: 60, y: 10 },
      { x: 60, y: 60 },
      { x: 10, y: 60 },
    ],
  },
  {
    author: 'jhon',
    name: 'tree',
    points: [
      { x: 30, y: 20 },
      { x: 50, y: 70 },
      { x: 10, y: 70 },
      { x: 30, y: 20 },
    ],
  },
  {
    author: 'maria',
    name: 'road',
    points: [
      { x: 20, y: 20 },
      { x: 80, y: 20 },
      { x: 120, y: 40 },
    ],
  },
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const buildHttpError = (status, message) => {
  const error = new Error(message)
  error.response = {
    status,
    data: { message },
  }
  return error
}

const apimock = {
  async getAll() {
    return clone(mockBlueprints)
  },

  async getByAuthor(author) {
    const data = mockBlueprints.filter((bp) => bp.author === author)
    if (!data.length) {
      throw buildHttpError(404, `No se encontraron planos para el autor: ${author}`)
    }
    return clone(data)
  },

  async getByAuthorAndName(author, name) {
    const bp = mockBlueprints.find((item) => item.author === author && item.name === name)
    if (!bp) {
      throw buildHttpError(404, `No se encontro el blueprint: ${name}`)
    }
    return clone(bp)
  },

  async create(blueprint) {
    mockBlueprints.push(clone(blueprint))
    return clone(blueprint)
  },

  async update(author, name, blueprint) {
    const index = mockBlueprints.findIndex((item) => item.author === author && item.name === name)
    if (index < 0) {
      throw buildHttpError(404, `No se encontro el blueprint: ${name}`)
    }
    mockBlueprints[index] = clone(blueprint)
    return clone(mockBlueprints[index])
  },

  async remove(author, name) {
    const index = mockBlueprints.findIndex((item) => item.author === author && item.name === name)
    if (index < 0) {
      throw buildHttpError(404, `No se encontro el blueprint: ${name}`)
    }
    mockBlueprints.splice(index, 1)
    return { author, name }
  },
}

export default apimock
