export interface User {
  id: string;
  name: string;
  email: string;
  role: 'seeker' | 'owner';
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
