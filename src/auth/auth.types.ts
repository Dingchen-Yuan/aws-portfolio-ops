export interface JwtPayload {
  sub: string;
  username: string;
  role: 'admin';
}

export interface AuthenticatedAdmin {
  username: string;
  role: 'admin';
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}
