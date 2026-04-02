export interface LoginResponse {
  access_token: string;
}

export interface LoginCredentials {
  identifier: string; // Alterado de 'cpf' para bater com o backend!
  password: string;
}