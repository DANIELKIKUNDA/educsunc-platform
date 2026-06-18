import type { GraviteAlerte, StatutAlerte } from '../enums';
import type { ContexteMonitoringProps, CorrelationMonitoringProps, SeuilAlerteProps } from '../value-objects';

// Ce fichier declare l entite metier d alerte.

/** Cette interface represente la vue serialisable d une alerte. */
export interface AlerteProps {
  readonly identifiant: string;
  readonly indicateur: string;
  readonly gravite: GraviteAlerte;
  readonly statut: StatutAlerte;
  readonly message: string;
  readonly seuil: SeuilAlerteProps;
  readonly valeurObservee: number;
  readonly contexte: ContexteMonitoringProps;
  readonly correlation: CorrelationMonitoringProps;
  readonly declencheeLe: Date;
  readonly resolueLe?: Date;
}

/** Cette classe represente une alerte declenchee par le domaine. */
export class Alerte {
  constructor(private readonly props: AlerteProps) {}

  /** Cette methode marque l alerte comme resolue. */
  public resoudre(a: Date): Alerte {
    return new Alerte({
      ...this.props,
      statut: 'RESOLVED',
      resolueLe: a,
    });
  }

  /** Cette methode retourne la representation serialisable de l alerte. */
  public valeur(): AlerteProps {
    return {
      ...this.props,
      contexte: { ...this.props.contexte },
      correlation: { ...this.props.correlation },
      seuil: { ...this.props.seuil },
    };
  }
}
