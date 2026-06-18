// Ce fichier declare les types techniques du bloc throttling Notifications.

/** Cette interface represente une cle technique de regulation pour le runtime Notifications. */
export interface CleThrottlingNotification {
  readonly identifiant: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly canal?: string;
  readonly typeWorker?: string;
}

/** Cette interface represente l'etat courant d'une fenetre de regulation. */
export interface EtatThrottlingNotification {
  readonly cle: string;
  readonly compteur: number;
  readonly limite: number;
  readonly fenetreDebutLe: Date;
  readonly fenetreExpireLe: Date;
}

/** Cette interface represente le resultat d'un controle technique de throttling. */
export interface ResultatThrottlingNotification {
  readonly autorise: boolean;
  readonly raison?: string;
  readonly controleLe: Date;
  readonly etat: EtatThrottlingNotification;
}
