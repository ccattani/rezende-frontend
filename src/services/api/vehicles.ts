import { api } from './client'

export type VehicleStatus = 'IN_STOCK' | 'SOLD' | 'CANCELED'

const BRAND = {
  red: '#C1121F',
  black: '#0B0B0B',
  white: '#FFFFFF',
  muted: '#9CA3AF',
}

export const vehicleStatusLabel: Record<
  VehicleStatus,
  { label: string; color: string; textColor: string }
> = {
  IN_STOCK: { label: 'Em estoque', color: BRAND.black, textColor: BRAND.white },
  SOLD: { label: 'Vendido', color: BRAND.red, textColor: BRAND.white },
  CANCELED: { label: 'Cancelado', color: BRAND.muted, textColor: BRAND.white },
}

export type Vehicle = {
  id: string
  plate: string
  model: string
  year: number
  purchaseValue: number
  saleValue: number | null
  status: VehicleStatus
  createdAt: string
}

export async function listVehicles(params?: { status?: VehicleStatus }) {
  const { data } = await api.get<Vehicle[]>('/vehicles', { params })
  return data
}

export async function getVehicleById(id: string) {
  const { data } = await api.get<Vehicle>(`/vehicles/${id}`)
  return data
}

export async function createVehicle(payload: {
  plate: string
  model: string
  year: number
  purchaseValue: number
}) {
  const { data } = await api.post<Vehicle>('/vehicles', payload)
  return data
}

export async function updateVehicle(
  id: string,
  payload: {
    plate?: string
    model?: string
    year?: number
    purchaseValue?: number
  }
) {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}`, payload)
  return data
}

export async function sellVehicle(id: string, payload: { saleValue: number }) {
  const { data } = await api.post(`/vehicles/${id}/sell`, payload)
  return data
}