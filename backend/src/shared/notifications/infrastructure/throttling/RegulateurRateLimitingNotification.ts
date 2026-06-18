// Ce fichier declare le regulateur technique de rate limiting du moteur Notifications.

import { CleThrottlingNotification, ResultatThrottlingNotification } from './TypesThrottlingNotification';

/** Cette classe applique une limitation glissante basee sur des horodatages recents. */
export class RegulateurRateLimitingNotification {
  /** Ce registre conserve l'historique recent des emissions par cle technique. */
  private readonly emissionsParCle = new Map<string, Date[]>();

  /** Ce constructeur fixe la taille de la fenetre glissante en millisecondes. */
  constructor(private readonly fenetreMs = 60_000) {}

  /** Cette methode controle si une nouvelle emission est encore autorisee dans la fenetre glissante. */
  public consommer(
    cle: CleThrottlingNotification,
    limite: number,
  ): ResultatThrottlingNotification {
    const cleTechnique = this.construireCleTechnique(cle);
    const maintenant = new Date();
    const emissions = this.nettoyerEtLire(cleTechnique, maintenant);
    emissions.push(maintenant);
    this.emissionsParCle.set(cleTechnique, emissions);

    const etat = {
      cle: cleTechnique,
      compteur: emissions.length,
      limite,
      fenetreDebutLe: new Date(maintenant.getTime() - this.fenetreMs),
      fenetreExpireLe: new Date(maintenant.getTime() + this.fenetreMs),
    };

    if (emissions.length > limite) {
      return {
        autorise: false,
        raison: 'La frequence des emissions depasse la fenetre glissante autorisee.',
        controleLe: maintenant,
        etat,
      };
    }

    return {
      autorise: true,
      controleLe: maintenant,
      etat,
    };
  }

  /** Cette methode retourne le nombre actuel d'emissions encore presentes dans la fenetre. */
  public observer(cle: CleThrottlingNotification): number {
    return this.nettoyerEtLire(this.construireCleTechnique(cle), new Date()).length;
  }

  /** Cette methode retire les emissions trop anciennes d'une cle donnee. */
  private nettoyerEtLire(cle: string, maintenant: Date): Date[] {
    const minimum = maintenant.getTime() - this.fenetreMs;
    const existantes = this.emissionsParCle.get(cle) ?? [];
    const nettoyees = existantes.filter((date) => date.getTime() >= minimum);
    this.emissionsParCle.set(cle, nettoyees);
    return nettoyees;
  }

  /** Cette methode construit la cle memoire stable du regulateur glissant. */
  private construireCleTechnique(cle: CleThrottlingNotification): string {
    return [
      cle.identifiant,
      cle.organisationId ?? '*',
      cle.ecoleId ?? '*',
      cle.canal ?? '*',
      cle.typeWorker ?? '*',
    ].join('::');
  }
}
