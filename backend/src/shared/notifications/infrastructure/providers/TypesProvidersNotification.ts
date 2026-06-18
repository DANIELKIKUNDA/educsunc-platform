import { CanalNotification, CriticiteLivraison, TypeNotification } from '../../domain';

// Ce fichier declare les types techniques du bloc providers Notifications.

/** Cette union represente l'etat de sante technique d'un provider de notification. */
export type EtatSanteProviderNotification = 'SAIN' | 'DEGRADE' | 'INDISPONIBLE';

/** Cette interface represente la charge technique remise a un provider de canal. */
export interface ChargeLivraisonNotification {
  readonly identifiantNotification: string;
  readonly typeNotification: TypeNotification;
  readonly canal: CanalNotification;
  readonly destinataire: string;
  readonly sujet?: string;
  readonly message: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly criticite: CriticiteLivraison;
}

/** Cette interface represente le resultat technique brut retourne par un provider. */
export interface ResultatLivraisonProviderNotification {
  readonly succes: boolean;
  readonly canal: CanalNotification;
  readonly fournisseur: string;
  readonly identifiantLivraison?: string;
  readonly horodatage: Date;
  readonly erreur?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un rapport de sante technique d'un provider. */
export interface RapportSanteProviderNotification {
  readonly fournisseur: string;
  readonly canal: CanalNotification;
  readonly etat: EtatSanteProviderNotification;
  readonly verifieLe: Date;
  readonly details: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le contrat commun de tous les providers techniques. */
export interface ProviderNotificationTechnique {
  /** Cette methode expose le nom technique du provider. */
  obtenirNom(): string;

  /** Cette methode expose le canal couvert par le provider. */
  obtenirCanal(): CanalNotification;

  /** Cette methode tente une livraison technique sur le canal cible. */
  envoyer(charge: ChargeLivraisonNotification): Promise<ResultatLivraisonProviderNotification>;

  /** Cette methode retourne un rapport de sante instantane du provider. */
  verifierSante(): Promise<RapportSanteProviderNotification>;
}
