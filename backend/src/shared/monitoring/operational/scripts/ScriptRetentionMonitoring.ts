import type { TraceDto } from '../../application';
import { InitialiseurOperationalMonitoring } from '../bootstrap';

// Ce fichier declare le script operationnel de retention du module Monitoring.

export class ScriptRetentionMonitoring {
  public executer(traces: readonly TraceDto[], limite = 100) {
    const operational = new InitialiseurOperationalMonitoring().initialiser();
    return operational.retention.executerRetention(traces, limite);
  }
}
