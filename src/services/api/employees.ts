import {api} from './client';
import type { Role, AuthUser } from '../../types/auth';

type CreateEmployeePayload = {
  name: string;
  email: string;
  password: string; // temporária
  role: Exclude<Role, 'CHEFE'>; // só COORDENADOR | COLABORADOR
};

type CreateEmployeeResponse = { user: AuthUser };

export async function createEmployee(payload: CreateEmployeePayload, token: string) {
  const { data } = await api.post<CreateEmployeeResponse>(
    '/auth/register',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}