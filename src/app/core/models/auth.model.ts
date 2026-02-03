export interface AuthResponse {
  accessToken: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}
