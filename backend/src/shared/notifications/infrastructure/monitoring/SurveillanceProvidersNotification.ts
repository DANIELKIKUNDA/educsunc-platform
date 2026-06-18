import { RegistreProvidersNotification } from '../providers';
import { VueSurveillanceProvidersNotifications } from './TypesMonitoringNotification';

// Ce fichier observe l'etat technique des providers du moteur Notifications.

/** Cette classe calcule un snapshot de supervision des providers techniques. */
export class SurveillanceProvidersNotification {
  /** Ce constructeur relie la surveillance au registre des providers. */
  constructor(private readonly registreProvidersNotification: RegistreProvidersNotification) {}

  /** Cette methode retourne une vue agrégée de l'etat des providers. */
  public async observer(): Promise<VueSurveillanceProvidersNotifications> {
    const rapports = await this.registreProvidersNotification.verifierSanteGlobale();

    return {
      totalProviders: rapports.length,
      totalSains: rapports.filter((rapport) => rapport.etat === 'SAIN').length,
      totalDegrades: rapports.filter((rapport) => rapport.etat === 'DEGRADE').length,
      totalIndisponibles: rapports.filter((rapport) => rapport.etat === 'INDISPONIBLE').length,
      fournisseurs: rapports.map((rapport) => ({
        fournisseur: rapport.fournisseur,
        canal: rapport.canal,
        etat: rapport.etat,
      })),
    };
  }
}
