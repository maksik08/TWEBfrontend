import { api } from '@/shared/api/client'

export const http = {
  get: api.get,
  post: api.post,
  put: api.put,
  patch: api.patch,
  delete: api.delete,
}
