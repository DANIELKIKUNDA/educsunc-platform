import type { NiveauSanteSysteme } from '../enums';
import type { ContexteMonitoringProps, CorrelationMonitoringProps } from '../value-objects';

// Ce fichier declare le diagnostic produit pour un incident.

/** Cette interface represente la vue serialisable d un diagnostic. */
export interface DiagnosticIncidentProps {
  readonly incidentId: string;
  readonly resume: string;
  readonly causesProbables: readonly string[];
  readonly recommandations: readonly string[];
  readonly niveau: NiveauSanteSysteme;
  readonly contexte: ContexteMonitoringProps;
  readonly correlation: CorrelationMonitoringProps;
  readonly genereLe: Date;
}

/** Cette classe represente un diagnostic incident. */
export class DiagnosticIncident {
  constructor(private readonly props: DiagnosticIncidentProps) {}

  /** Cette methode retourne la representation serialisable du diagnostic. */
  public valeur(): DiagnosticIncidentProps {
    return {
      ...this.props,
      causesProbables: [...this.props.causesProbables],
      recommandations: [...this.props.recommandations],
      contexte: { ...this.props.contexte },
      correlation: { ...this.props.correlation },
    };
  }
}
