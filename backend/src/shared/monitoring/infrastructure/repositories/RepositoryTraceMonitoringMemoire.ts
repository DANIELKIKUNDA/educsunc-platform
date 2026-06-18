import type { FiltreMonitoring, PortRepositoryTrace, TraceOperation } from '../../domain';
import type { MonitoringTracingPort } from '../../application';
import { StockageTracesMonitoringMemoire } from '../persistence';

// Ce fichier declare le repository memoire des traces Monitoring.

/** Cette classe represente l implementation memoire des traces. */
export class RepositoryTraceMonitoringMemoire implements PortRepositoryTrace, MonitoringTracingPort {
  constructor(private readonly stockage = new StockageTracesMonitoringMemoire()) {}

  /** Cette methode persiste une trace dans le stockage local. */
  public async sauvegarder(trace: TraceOperation): Promise<void> {
    this.stockage.enregistrer(trace);
  }

  /** Cette methode recherche des traces selon un filtre simple. */
  public async rechercherParFiltre(_filtre: FiltreMonitoring): Promise<readonly TraceOperation[]> {
    return this.stockage.lister();
  }

  /** Cette methode enregistre une trace via le port applicatif. */
  public async enregistrerTrace(trace: TraceOperation): Promise<void> {
    await this.sauvegarder(trace);
  }

  /** Cette methode retourne des traces par identifiants si fournis. */
  public async retrouverTraces(ids?: readonly string[]): Promise<readonly TraceOperation[]> {
    if (!ids || ids.length === 0) {
      return this.stockage.lister();
    }
    return ids
      .map((identifiant) => this.stockage.lire(identifiant))
      .filter((trace): trace is TraceOperation => trace !== null);
  }

  /** Cette methode liste toutes les traces stockees. */
  public async listerTraces(): Promise<readonly TraceOperation[]> {
    return this.stockage.lister();
  }

  /** Cette methode expose le stockage sous-jacent. */
  public stockageMemoire(): StockageTracesMonitoringMemoire {
    return this.stockage;
  }
}
