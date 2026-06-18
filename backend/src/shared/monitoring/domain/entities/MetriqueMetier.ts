import type { ContexteMonitoringProps, ValeurMetriqueProps } from '../value-objects';

// Ce fichier declare une metrique metier du domaine Monitoring.

/** Cette interface represente la vue serialisable d une metrique metier. */
export interface MetriqueMetierProps {
  readonly nom: string;
  readonly agregat: string;
  readonly valeur: ValeurMetriqueProps;
  readonly contexte: ContexteMonitoringProps;
}

/** Cette classe represente une metrique metier collecte. */
export class MetriqueMetier {
  constructor(private readonly props: MetriqueMetierProps) {}

  /** Cette methode retourne la representation serialisable de la metrique. */
  public valeur(): MetriqueMetierProps {
    return {
      ...this.props,
      valeur: { ...this.props.valeur },
      contexte: { ...this.props.contexte },
    };
  }
}
