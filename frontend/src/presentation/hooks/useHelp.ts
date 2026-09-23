import { useState, useCallback, useMemo } from 'react';
import { HelpModel } from '../../domain/models/help.model';
import { ApiHelpRepository } from '../../infrastructure/repositories/api-help.repository';
import { GetHelpUseCase } from '../../application/use-cases/get-help.use-case';

export function useHelp() {
  const [data, setData] = useState<HelpModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHelpUseCase = useMemo(() => {
    const repository = new ApiHelpRepository();
    return new GetHelpUseCase(repository);
  }, []);

  const fetchHelp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHelpUseCase.execute();
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el backend');
    } finally {
      setLoading(false);
    }
  }, [getHelpUseCase]);

  return {
    data,
    loading,
    error,
    fetchHelp,
  };
}
