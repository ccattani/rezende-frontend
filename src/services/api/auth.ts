import { api } from './client'
import type { LoginResponse } from '../../types/auth'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}
export async function register(name: string, email: string, password: string) {
  // seu backend registra como OPERATOR
  const { data } = await api.post<LoginResponse>('/auth/register', { name, email, password })
  return data
}