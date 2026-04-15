import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

interface UseApiOptions<T> {
  url: string
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  data?: unknown
  immediate?: boolean
}

interface UseApiReturn<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (overrideData?: unknown) => Promise<void>
  reset: () => void
}

export function useApi<T>(options: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (overrideData?: unknown) => {
    setIsLoading(true)
    setError(null)

    try {
      const requestData = overrideData ?? options.data
      let response

      switch (options.method) {
        case 'post':
          response = await api.post<T>(options.url, requestData)
          break
        case 'put':
          response = await api.put<T>(options.url, requestData)
          break
        case 'patch':
          response = await api.patch<T>(options.url, requestData)
          break
        case 'delete':
          response = await api.delete<T>(options.url)
          break
        default:
          response = await api.get<T>(options.url)
      }

      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [options.url, options.method, options.data])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (options.immediate !== false) {
      execute()
    }
  }, [])

  return { data, error, isLoading, execute, reset }
}
