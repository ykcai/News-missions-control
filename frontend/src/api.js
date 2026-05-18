import axios from 'axios'

export const api = axios.create({
  baseURL: '',
  timeout: 15000,
})

export async function getHealth() {
  const { data } = await api.get('/api/health')
  return data
}

export async function getSummary() {
  const { data } = await api.get('/api/summary')
  return data
}

export async function getCritical() {
  const { data } = await api.get('/api/critical')
  return data.items || []
}

export async function getItems(category, limit = 200) {
  const { data } = await api.get('/api/items', { params: { category, limit } })
  return data.items || []
}

export async function refresh() {
  const { data } = await api.post('/api/refresh')
  return data
}
