export interface LoginInputDto {
  email: string;
  password: string;
  // Datos opcionales del dispositivo para registro y trazabilidad
  deviceId?: string;
  plataforma?: string;
  modelo?: string;
  versionSo?: string;
  pushToken?: string;
  ip?: string;
}

export interface LoginOutputDto {
  accessToken: string;
  user: {
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
  };
}
