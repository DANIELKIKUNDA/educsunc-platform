import {
  ChargeLivraisonNotification,
  ProviderNotificationTechnique,
  RapportSanteProviderNotification,
  ResultatLivraisonProviderNotification,
} from './TypesProvidersNotification';

// Ce fichier encapsule la degradation et la panne technique d'un provider Notifications.

/** Cette classe protege un provider contre les pannes et expose un etat de sante coherent. */
export class AdaptateurPanneProviderNotification implements ProviderNotificationTechnique {
  private etatForce: RapportSanteProviderNotification['etat'] | null = null;

  /** Ce constructeur relie l'adaptateur au provider technique reel. */
  constructor(private readonly providerNotificationTechnique: ProviderNotificationTechnique) {}

  /** Cette methode expose le nom technique du provider protege. */
  public obtenirNom(): string {
    return this.providerNotificationTechnique.obtenirNom();
  }

  /** Cette methode expose le canal du provider protege. */
  public obtenirCanal() {
    return this.providerNotificationTechnique.obtenirCanal();
  }

  /** Cette methode force un etat de sante degrade ou indisponible. */
  public forcerEtat(etat: RapportSanteProviderNotification['etat'] | null): void {
    this.etatForce = etat;
  }

  /** Cette methode tente une livraison ou bloque proprement si le provider est force hors service. */
  public async envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification> {
    if (this.etatForce === 'INDISPONIBLE') {
      return {
        succes: false,
        canal: this.obtenirCanal(),
        fournisseur: this.obtenirNom(),
        horodatage: new Date(),
        erreur: 'Le provider est force en indisponibilite technique.',
        metadata: {
          charge: {
            identifiantNotification: charge.identifiantNotification,
          },
        },
      };
    }
    return this.providerNotificationTechnique.envoyer(charge);
  }

  /** Cette methode retourne l'etat force s'il existe, sinon l'etat reel du provider. */
  public async verifierSante(): Promise<RapportSanteProviderNotification> {
    const rapport = await this.providerNotificationTechnique.verifierSante();
    if (this.etatForce === null) {
      return rapport;
    }
    return {
      ...rapport,
      etat: this.etatForce,
      details: {
        ...rapport.details,
        etatForce: true,
      },
    };
  }
}
