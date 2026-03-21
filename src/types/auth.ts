export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  npi: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  email: string;
  password: string;
}
