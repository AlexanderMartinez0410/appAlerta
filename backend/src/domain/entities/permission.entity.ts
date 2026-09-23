export class PermissionEntity {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly moduloId: string,
    public readonly createdAt: Date,
  ) {}
}
