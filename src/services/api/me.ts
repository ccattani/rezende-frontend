import { api } from './client'
import type { AuthUser } from '../../types/auth'

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me')
  return data.user
}