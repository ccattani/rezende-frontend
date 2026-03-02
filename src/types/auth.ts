export type Role = 'CHEFE' | 'COORDENADOR' | 'COLABORADOR'

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export type LoginResponse = {
  user: AuthUser
  token: string
}