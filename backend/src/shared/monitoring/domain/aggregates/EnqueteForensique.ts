import { EvenementSysteme, TraceOperation } from '../entities';
import { CorrelationMonitoring, MonitoringId } from '../value-objects';

// Ce fichier declare l agregat racine d enquete forensique.

/** Cette interface represente la vue serialisable d une enquete forensique. */
export interface EnqueteForensiqueDetails {
  readonly identifiant: string;
  readonly correlation: ReturnType<CorrelationMonitoring['valeur']>;
  readonly traces: readonly ReturnType<TraceOperation['valeur']>[];
  readonly evenements: readonly ReturnType<EvenementSysteme['valeur']>[];
  readonly ouverteLe: Date;
}

/** Cette classe represente une enquete forensique du domaine Monitoring. */
export class EnqueteForensique {
  private readonly traces: TraceOperation[] = [];
  private readonly evenements: EvenementSysteme[] = [];

  constructor(
    private readonly identifiant: MonitoringId,
    private readonly correlation: CorrelationMonitoring,
    private readonly ouverteLe = new Date(),
  ) {}

  /** Cette methode ajoute une trace a l enquete. */
  public ajouterTrace(trace: TraceOperation): void {
    this.traces.push(trace);
  }

  /** Cette methode ajoute un evenement a l enquete. */
  public ajouterEvenement(evenement: EvenementSysteme): void {
    this.evenements.push(evenement);
  }

  /** Cette methode retourne la vue serialisable de l enquete. */
  public details(): EnqueteForensiqueDetails {
    return {
      identifiant: this.identifiant.valeur(),
      correlation: this.correlation.valeur(),
      traces: this.traces.map((trace) => trace.valeur()),
      evenements: this.evenements.map((evenement) => evenement.valeur()),
      ouverteLe: this.ouverteLe,
    };
  }
}
