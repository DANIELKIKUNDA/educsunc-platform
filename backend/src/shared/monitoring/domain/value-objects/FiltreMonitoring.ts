import type { GraviteAlerte, NiveauSanteSysteme, SourceTechnique, TypeMetrique, TypeTrace } from '../enums';

// Ce fichier declare les filtres de lecture du domaine Monitoring.

/** Cette interface represente les filtres de lecture Monitoring. */
export interface FiltreMonitoringProps {
  readonly gravites?: readonly GraviteAlerte[];
  readonly niveauxSante?: readonly NiveauSanteSysteme[];
  readonly sources?: readonly SourceTechnique[];
  readonly typesMetrique?: readonly TypeMetrique[];
  readonly typesTrace?: readonly TypeTrace[];
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly composant?: string;
}

/** Cette classe represente un filtre metier serialisable. */
export class FiltreMonitoring {
  constructor(private readonly props: FiltreMonitoringProps) {}

  /** Cette methode retourne la representation serialisable du filtre. */
  public valeur(): FiltreMonitoringProps {
    return {
      ...this.props,
      gravites: this.props.gravites ? [...this.props.gravites] : undefined,
      niveauxSante: this.props.niveauxSante ? [...this.props.niveauxSante] : undefined,
      sources: this.props.sources ? [...this.props.sources] : undefined,
      typesMetrique: this.props.typesMetrique ? [...this.props.typesMetrique] : undefined,
      typesTrace: this.props.typesTrace ? [...this.props.typesTrace] : undefined,
    };
  }
}
