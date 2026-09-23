export class PersonEntity {
  constructor(
    public readonly id: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly tipoDocumento: string,
    public readonly numeroDocumento: string,
    public readonly telefono: string | null,
    public readonly direccion: string | null,
    public readonly fechaNacimiento: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
