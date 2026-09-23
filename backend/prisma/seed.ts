import { PrismaClient, TipoDocumento, EstadoUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seeding de Base de Datos...');

  // ---------------------------------------------------------------------------
  // 1. Categorías y Motivos de Ayuda Comunitaria Dinámicos
  // ---------------------------------------------------------------------------
  const categoriasData = [
    {
      codigo: 'SEGURIDAD',
      nombre: 'Seguridad y Alerta Vecinal',
      descripcion: 'Reportes ciudadanos para advertir sobre robos y situaciones de peligro',
      colorHex: '#DA291C',
      orden: 1,
      motivos: [
        { codigo: 'ROBO_TRANSEUNTE', nombre: 'Robo a persona / Asalto', orden: 1 },
        { codigo: 'ROBO_VEHICULO', nombre: 'Robo de auto o accesorios', orden: 2 },
        { codigo: 'SOSPECHA', nombre: 'Actividad sospechosa en la cuadra', orden: 3 },
        { codigo: 'PANICO', nombre: 'Petición de auxilio urgente', orden: 4 },
      ],
    },
    {
      codigo: 'TRANSITO',
      nombre: 'Tránsito y Estado de Vías',
      descripcion: 'Avisos de congestión, choques y semáforos para tomar rutas alternas',
      colorHex: '#EA580C',
      orden: 2,
      motivos: [
        { codigo: 'CONGESTION', nombre: 'Trancón / Tráfico pesado', orden: 1 },
        { codigo: 'ACCIDENTE', nombre: 'Choque o accidente vehicular', orden: 2 },
        { codigo: 'SEMAFORO_DANADO', nombre: 'Semáforo apagado / Dañado', orden: 3 },
        { codigo: 'VIA_CERRADA', nombre: 'Calle cerrada u obstáculos', orden: 4 },
      ],
    },
    {
      codigo: 'TRANSPORTE',
      nombre: 'Transporte Público y Buses',
      descripcion: 'Avisos sobre buses dañados, retrasos y paradas colapsadas',
      colorHex: '#D97706',
      orden: 3,
      motivos: [
        { codigo: 'BUS_AVERIADO', nombre: 'Bus dañado / Varado', campoExtraLabel: 'Línea o Cooperativa de bus', orden: 1 },
        { codigo: 'PARADA_LLENA', nombre: 'Parada colapsada / Sin unidades', orden: 2 },
        { codigo: 'RETRASO_LINEA', nombre: 'Retraso grave de ruta', campoExtraLabel: 'Línea de transporte', orden: 3 },
      ],
    },
  ];

  for (const cat of categoriasData) {
    const createdCat = await prisma.categoriaIncidente.upsert({
      where: { codigo: cat.codigo },
      update: {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        colorHex: cat.colorHex,
        orden: cat.orden,
      },
      create: {
        codigo: cat.codigo,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        colorHex: cat.colorHex,
        orden: cat.orden,
      },
    });

    for (const mot of cat.motivos) {
      await prisma.motivoIncidente.upsert({
        where: { codigo: mot.codigo },
        update: {
          nombre: mot.nombre,
          campoExtraLabel: (mot as any).campoExtraLabel || null,
          orden: mot.orden,
          categoriaId: createdCat.id,
        },
        create: {
          codigo: mot.codigo,
          nombre: mot.nombre,
          campoExtraLabel: (mot as any).campoExtraLabel || null,
          orden: mot.orden,
          categoriaId: createdCat.id,
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Roles
  // ---------------------------------------------------------------------------
  const rolesData = [
    { codigo: 'SUPERADMIN', nombre: 'Super Administrador' },
    { codigo: 'POLICIA', nombre: 'Fuerzas Policiales' },
    { codigo: 'CIUDADANO', nombre: 'Ciudadano' },
  ];

  const rolesMap = new Map<string, string>();
  for (const r of rolesData) {
    const record = await prisma.rol.upsert({
      where: { codigo: r.codigo },
      update: { nombre: r.nombre },
      create: r,
    });
    rolesMap.set(r.codigo, record.id);
  }

  // ---------------------------------------------------------------------------
  // 3. Usuario Administrador (Tus datos)
  // ---------------------------------------------------------------------------
  const adminPasswordHash = await bcrypt.hash('Admin1234!', 10);
  const personaAdmin = await prisma.persona.upsert({
    where: { numeroDocumento: '1729334373' },
    update: { telefono: '+593 96 996 2799' },
    create: {
      nombres: 'Administrador',
      apellidos: 'Principal',
      tipoDocumento: TipoDocumento.CEDULA,
      numeroDocumento: '1729334373',
      telefono: '+593 96 996 2799',
      direccion: 'Quito, Ecuador',
    },
  });

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: 'alkut202@gmail.com' },
    update: {
      personaId: personaAdmin.id,
      estado: EstadoUsuario.ACTIVO,
      reputacionScore: 10,
    },
    create: {
      email: 'alkut202@gmail.com',
      passwordHash: adminPasswordHash,
      estado: EstadoUsuario.ACTIVO,
      personaId: personaAdmin.id,
      reputacionScore: 10,
    },
  });

  await prisma.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: usuarioAdmin.id, rolId: rolesMap.get('SUPERADMIN')! } },
    update: {},
    create: {
      usuarioId: usuarioAdmin.id,
      rolId: rolesMap.get('SUPERADMIN')!,
    },
  });

  // ---------------------------------------------------------------------------
  // 4. Usuario Fuerzas Policiales
  // ---------------------------------------------------------------------------
  const policiaPasswordHash = await bcrypt.hash('Policia1234!', 10);
  const personaPolicia = await prisma.persona.upsert({
    where: { numeroDocumento: '1799999999' },
    update: { telefono: '+593 99 999 9999' },
    create: {
      nombres: 'Central 911 / Monitoreo',
      apellidos: 'Policía Nacional',
      tipoDocumento: TipoDocumento.CIP,
      numeroDocumento: '1799999999',
      telefono: '+593 99 999 9999',
      direccion: 'Comando Central de Policía',
    },
  });

  const usuarioPolicia = await prisma.usuario.upsert({
    where: { email: 'policia@alerta.gob.ec' },
    update: {
      personaId: personaPolicia.id,
      estado: EstadoUsuario.ACTIVO,
      reputacionScore: 10,
    },
    create: {
      email: 'policia@alerta.gob.ec',
      passwordHash: policiaPasswordHash,
      estado: EstadoUsuario.ACTIVO,
      personaId: personaPolicia.id,
      reputacionScore: 10,
    },
  });

  await prisma.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: usuarioPolicia.id, rolId: rolesMap.get('POLICIA')! } },
    update: {},
    create: {
      usuarioId: usuarioPolicia.id,
      rolId: rolesMap.get('POLICIA')!,
    },
  });

  console.log('✅ Seeding completado con categorías comunitarias dinámicas.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
