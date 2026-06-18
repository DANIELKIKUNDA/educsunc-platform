// Ce fichier declare le plan de retention operationnel du module Monitoring.

export interface PlanRetentionMonitoring {
  readonly tracesJours: number;
  readonly diagnosticsJours: number;
  readonly forensicJours: number;
}
