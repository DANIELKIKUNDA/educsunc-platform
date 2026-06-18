import type { SourceTechnique } from '../enums';
import type { ContexteMonitoringProps, CorrelationMonitoringProps } from '../value-objects';

// Ce fichier declare un signal brut recu par le domaine Monitoring.

/** Cette interface represente la vue serialisable d un signal systeme. */
export interface SignalSystemeProps {
  readonly type: string;
  readonly source: SourceTechnique;
  readonly nom: string;
  readonly valeur: number;
  readonly unite: string;
  readonly contexte: ContexteMonitoringProps;
  readonly correlation: CorrelationMonitoringProps;
  readonly recuLe: Date;
}

/** Cette classe represente un signal systeme brut. */
export class SignalSysteme {
  constructor(private readonly props: SignalSystemeProps) {}

  /** Cette methode retourne la representation serialisable du signal. */
  public valeur(): SignalSystemeProps {
    return {
      ...this.props,
      contexte: { ...this.props.contexte },
      correlation: { ...this.props.correlation },
    };
  }
}
