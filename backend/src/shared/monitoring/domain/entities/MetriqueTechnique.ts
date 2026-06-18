import type { SourceTechnique } from '../enums';
import type { ContexteMonitoringProps, ValeurMetriqueProps } from '../value-objects';

// Ce fichier declare une metrique technique du domaine Monitoring.

/** Cette interface represente la vue serialisable d une metrique technique. */
export interface MetriqueTechniqueProps {
  readonly nom: string;
  readonly source: SourceTechnique;
  readonly valeur: ValeurMetriqueProps;
  readonly contexte: ContexteMonitoringProps;
}

/** Cette classe represente une metrique technique observee. */
export class MetriqueTechnique {
  constructor(private readonly props: MetriqueTechniqueProps) {}

  /** Cette methode retourne la representation serialisable de la metrique. */
  public valeur(): MetriqueTechniqueProps {
    return {
      ...this.props,
      valeur: { ...this.props.valeur },
      contexte: { ...this.props.contexte },
    };
  }
}
