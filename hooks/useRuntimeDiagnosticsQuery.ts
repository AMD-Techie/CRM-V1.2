import { useQuery } from '@tanstack/react-query';
import { runtimeDiagnosticsApi } from '../api/runtimeDiagnosticsApi';
import { RuntimeDiagnosticItem } from '../types/ai';

export const DIAGNOSTICS_QUERY_KEY = ['runtime-diagnostics'] as const;

export function useRuntimeDiagnosticsQuery() {
  return useQuery<RuntimeDiagnosticItem[]>({
    queryKey: DIAGNOSTICS_QUERY_KEY,
    queryFn: () => runtimeDiagnosticsApi.getDiagnostics(),
    staleTime: 1000 * 60 * 2
  });
}
