import { ExceptionCrossTenantMonitoring } from '../exceptions';

// Ce fichier declare le contexte de portee tenant et technique du monitoring.

/** Cette interface represente les donnees de contexte d observation. */
export interface ContexteMonitoringProps {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly module?: string;
  readonly composant?: string;
  readonly correlationId?: string;
}

/** Cette classe represente le contexte metier d une observation. */
export class ContexteMonitoring {
  private constructor(private readonly props: ContexteMonitoringProps) {}

  /** Cette methode cree un contexte Monitoring. */
  public static creer(props: ContexteMonitoringProps): ContexteMonitoring {
    return new ContexteMonitoring({ ...props });
  }

  /** Cette methode verifie la compatibilite tenant entre deux contextes. */
  public verifierCompatibilite(autre: ContexteMonitoring): void {
    const courant = this.props;
    const cible = autre.props;

    if (
      courant.organisationId
      && cible.organisationId
      && courant.organisationId !== cible.organisationId
    ) {
      throw new ExceptionCrossTenantMonitoring();
    }

    if (courant.ecoleId && cible.ecoleId && courant.ecoleId !== cible.ecoleId) {
      throw new ExceptionCrossTenantMonitoring();
    }
  }

  /** Cette methode retourne la valeur serialisable du contexte. */
  public valeur(): ContexteMonitoringProps {
    return { ...this.props };
  }
}
