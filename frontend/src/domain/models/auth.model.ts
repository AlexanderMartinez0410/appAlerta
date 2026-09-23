export interface UserProfile {
  id: string;
  email: string;
  estado: string;
  persona: {
    id: string;
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string | null;
    direccion: string | null;
  } | null;
  roles: string[];
  permisos: string[];
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
