import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare la query de lecture des diagnostics.

/** Cette interface represente la query de lecture des diagnostics. */
export interface GetDiagnosticsQuery {
  readonly contexte: MonitoringContextInputDto;
}
