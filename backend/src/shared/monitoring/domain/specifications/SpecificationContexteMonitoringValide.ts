import { ContexteMonitoring } from '../value-objects';

// Ce fichier declare la specification de validite d un contexte Monitoring.

/** Cette classe represente la specification de validite du contexte Monitoring. */
export class SpecificationContexteMonitoringValide {
  /** Cette methode indique si le contexte declare assez d informations. */
  public estSatisfaite(contexte: ContexteMonitoring): boolean {
    const valeur = contexte.valeur();
    return Boolean(valeur.organisationId || valeur.ecoleId || valeur.module || valeur.composant);
  }
}
