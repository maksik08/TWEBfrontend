import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'
import { tokenService } from '@/shared/lib/token'

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const setAuthorizationHeader = (config: InternalAxiosRequestConfig, token: string) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders()
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`)
    return
  }

  // Fallback for raw header objects.
  const rawHeaders = config.headers as unknown as Record<string, string>
  rawHeaders.Authorization = `Bearer ${token}`
}

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = tokenService.get()

  if (token) {
    setAuthorizationHeader(config, token)
  }

  return config
})

const refreshApi = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError
    const originalRequest = axiosError.config as RetriableRequestConfig | undefined

    if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (token) {
            setAuthorizationHeader(originalRequest, token)
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await refreshApi.post('/auth/refresh')
        const nextToken: string | undefined = response?.data?.accessToken

        if (!nextToken) {
          throw new Error('Refresh did not return accessToken')
        }

        tokenService.set(nextToken)
        processQueue(null, nextToken)

        setAuthorizationHeader(originalRequest, nextToken)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        tokenService.remove()

        // Keep shared/api independent from app/entities: let upper layers decide how to clear state.
        window.dispatchEvent(new CustomEvent('auth:logout'))

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
