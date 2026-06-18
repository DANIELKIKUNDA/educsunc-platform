import type { DtoHttpDiagnostic } from '../dto/outputs';

// Ce fichier declare les contrats HTTP de diagnostics Monitoring.

/** Cette interface represente les sorties HTTP de diagnostics. */
export interface ContratsHttpDiagnosticsMonitoring {
  readonly diagnostics: readonly DtoHttpDiagnostic[];
}
