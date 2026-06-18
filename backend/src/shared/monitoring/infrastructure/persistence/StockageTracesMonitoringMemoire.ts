import type { TraceOperation } from '../../domain';
import type { EntreeStockageTraceMonitoring } from './TypesPersistenceMonitoring';

// Ce fichier declare le stockage memoire des traces Monitoring.

/** Cette classe represente le stockage local des traces. */
export class StockageTracesMonitoringMemoire {
  private readonly traces = new Map<string, EntreeStockageTraceMonitoring>();

  /** Cette methode enregistre une trace dans le stockage local. */
  public enregistrer(trace: TraceOperation): void {
    this.traces.set(trace.valeur().identifiant, {
      trace,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode retourne toutes les traces stockees. */
  public lister(): readonly TraceOperation[] {
    return [...this.traces.values()].map((entree) => entree.trace);
  }

  /** Cette methode retourne une trace par identifiant. */
  public lire(identifiant: string): TraceOperation | null {
    return this.traces.get(identifiant)?.trace ?? null;
  }
}
