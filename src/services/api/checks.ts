import { api } from './index' // seu axios instance

export type CheckStatus = 'PENDING' | 'CLEARED' | 'RETURNED'

export type Check = {
  id: string
  beneficiaryName: string
  amount: number
  dueDate?: string
  status: CheckStatus
  createdAt: string
  // opcional: vehicleId, notes, documentUrl...
}

export type CreateCheckDTO = {
  beneficiaryName: string
  amount: number
  dueDate?: string
  notes?: string
  vehicleId?: string
}

export async function listChecks(params?: { status?: CheckStatus }) {
  const { data } = await api.get('/checks', { params })
  return data as Check[]
}

export async function createCheck(dto: CreateCheckDTO) {
  const { data } = await api.post('/checks', dto)
  return data
}

export async function updateCheckStatus(id: string, status: CheckStatus) {
  const { data } = await api.patch(`/checks/${id}/status`, { status })
  return data
}