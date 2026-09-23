import { Platform } from 'react-native';

/**
 * Paleta de Colores de Ecuador
 */
export const EcuadorColors = {
  yellow: {
    primary: '#FFD100', // Amarillo bandera
    amber: '#F59E0B',
  },
  blue: {
    primary: '#0033A0', // Azul bandera
    navy: '#0F172A',
    royal: '#1D4ED8',
  },
  red: {
    primary: '#DA291C', // Rojo bandera
    emergency: '#EF4444',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    grayLight: '#F3F4F6',
    grayMedium: '#9CA3AF',
    grayDark: '#1F2937',
  },
} as const;

export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
  },
  dark: {
    background: '#FFFFFF',
    text: '#000000',
  },
} as const;
