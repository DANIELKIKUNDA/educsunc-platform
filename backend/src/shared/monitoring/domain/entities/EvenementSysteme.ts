import type { ContexteMonitoringProps, CorrelationMonitoringProps } from '../value-objects';

// Ce fichier declare un evenement metier ou technique observe par Monitoring.

/** Cette interface represente la vue serialisable d un evenement systeme. */
export interface EvenementSystemeProps {
  readonly type: string;
  readonly nom: string;
  readonly message: string;
  readonly chargeUtile: Record<string, unknown>;
  readonly contexte: ContexteMonitoringProps;
  readonly correlation: CorrelationMonitoringProps;
  readonly emisLe: Date;
}

/** Cette classe represente un evenement observe par le domaine. */
export class EvenementSysteme {
  constructor(private readonly props: EvenementSystemeProps) {}

  /** Cette methode retourne la representation serialisable de l evenement. */
  public valeur(): EvenementSystemeProps {
    return {
      ...this.props,
      chargeUtile: { ...this.props.chargeUtile },
      contexte: { ...this.props.contexte },
      correlation: { ...this.props.correlation },
    };
  }
}
