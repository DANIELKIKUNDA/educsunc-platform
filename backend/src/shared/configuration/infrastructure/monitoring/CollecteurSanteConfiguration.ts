import { EtatSanteConfiguration } from './TypesMonitoringConfiguration';

// Ce fichier declare le collecteur de sante.

/** Cette classe represente la collecte technique de sante de l infrastructure. */
export class CollecteurSanteConfiguration {
  private readonly etats: EtatSanteConfiguration[] = [];

  /** Cette methode enregistre un etat de sante de composant. */
  public enregistrer(
    composant: EtatSanteConfiguration['composant'],
    statut: EtatSanteConfiguration['statut'],
    details: string,
  ): void {
    this.etats.push({
      composant,
      statut,
      details,
      observeLe: new Date(),
    });
  }

  /** Cette methode retourne les etats de sante memorises. */
  public journal(): readonly EtatSanteConfiguration[] {
    return [...this.etats];
  }
}
