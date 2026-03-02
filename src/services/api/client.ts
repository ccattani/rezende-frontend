import axios from 'axios'
import { getItem } from '../../utils/storage' // ajuste o caminho se necessário

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL

if (!baseURL) {
  console.warn('EXPO_PUBLIC_API_BASE_URL não definido. Crie o .env e reinicie o expo.')
}

export const TOKEN_KEY = 'rezend_token'

export const api = axios.create({
  baseURL,
  timeout: 20000,
})

api.interceptors.request.use(async (config) => {
  const token = await getItem(TOKEN_KEY)
  if (token) {
    config.headers = (config.headers ?? {}) as any
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})