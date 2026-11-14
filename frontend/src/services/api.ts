import axios, { AxiosInstance, AxiosError } from 'axios'

// VITE_API_URL may be given with or without the trailing /api; normalise to exactly one.
const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '').replace(/\/api$/, '') + '/api'

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zeus_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // An expired/invalid session sends the user to /login, but a failed login attempt must
    // stay on the page so the form can show its error.
    const isAuthAttempt = /\/auth\/(login|register)/.test(error.config?.url ?? '')
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('zeus_token')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** Drop empty-string / undefined / null fields so optional backend validators don't reject blank form inputs. */
export function clean<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  ) as T
}
