/** Authenticated user shape returned from the API */
export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'driver' | 'staff';
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LoginPayload {
  userId: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ForceChangePasswordPayload {
  newPassword: string;
}

export interface CreateUserPayload {
  name: string;
  role: 'admin' | 'driver' | 'staff';
  tempPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
