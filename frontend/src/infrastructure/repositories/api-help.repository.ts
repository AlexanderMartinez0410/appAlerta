import { IHelpRepository } from '../../domain/repositories/help.repository';
import { HelpModel } from '../../domain/models/help.model';
import { API_CONFIG } from '../config/api.config';

export class ApiHelpRepository implements IHelpRepository {
  async getHelpMessage(): Promise<HelpModel> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/help`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido de red al consultar el backend');
    }
  }
}
