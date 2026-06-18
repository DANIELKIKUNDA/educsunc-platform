import type { TypeTrace } from '../enums';
import type { ContexteMonitoringProps, CorrelationMonitoringProps } from '../value-objects';

// Ce fichier declare une trace d execution ou d observation.

/** Cette interface represente la vue serialisable d une trace. */
export interface TraceOperationProps {
  readonly identifiant: string;
  readonly type: TypeTrace;
  readonly operation: string;
  readonly succes: boolean;
  readonly dureeMillisecondes: number;
  readonly message?: string;
  readonly contexte: ContexteMonitoringProps;
  readonly correlation: CorrelationMonitoringProps;
  readonly captureeLe: Date;
}

/** Cette classe represente une trace exploitable par le domaine. */
export class TraceOperation {
  constructor(private readonly props: TraceOperationProps) {}

  /** Cette methode retourne la representation serialisable de la trace. */
  public valeur(): TraceOperationProps {
    return {
      ...this.props,
      contexte: { ...this.props.contexte },
      correlation: { ...this.props.correlation },
    };
  }
}
