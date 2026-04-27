import { ErreurIdempotence } from '../exceptions/ErreurIdempotence';

// Ce fichier contient le service applicatif d'idempotence des commandes critiques.
export interface EnregistrementIdempotence<TSortie> {
  cleIdempotence: string;
  empreintePayload: string;
  sortie: TSortie;
}

export interface StoreIdempotenceApplication<TSortie = unknown> {
  trouver(cleIdempotence: string): Promise<EnregistrementIdempotence<TSortie> | null>;
  enregistrer(cleIdempotence: string, empreintePayload: string, sortie: TSortie): Promise<void>;
}

/**
 * Ce service verifie et rejoue les commandes deja traitees.
 */
export class ServiceApplicationIdempotence<TSortie = unknown> {
  constructor(private readonly storeIdempotence?: StoreIdempotenceApplication<TSortie>) {}

  /** Exige une cle idempotente pour une commande critique. */
  public exigerCle(cleIdempotence?: string): string {
    if (cleIdempotence === undefined || cleIdempotence.trim().length === 0) {
      throw new ErreurIdempotence('Idempotency-Key est obligatoire pour cette commande.');
    }

    return cleIdempotence.trim();
  }

  /** Retourne une sortie deja calculee si la commande a deja ete traitee. */
  public async trouverSortieDejaTraitee(cleIdempotence: string, empreintePayload: string): Promise<TSortie | null> {
    const enregistrement = await this.storeIdempotence?.trouver(cleIdempotence);

    if (enregistrement === undefined || enregistrement === null) {
      return null;
    }

    if (enregistrement.empreintePayload !== empreintePayload) {
      throw new ErreurIdempotence('La meme cle idempotente a ete utilisee avec un payload different.');
    }

    return enregistrement.sortie;
  }

  /** Enregistre le resultat d'une commande idempotente. */
  public async enregistrerSortie(cleIdempotence: string, empreintePayload: string, sortie: TSortie): Promise<void> {
    await this.storeIdempotence?.enregistrer(cleIdempotence, empreintePayload, sortie);
  }

  /** Produit une empreinte stable minimale du payload. */
  public creerEmpreintePayload(payload: unknown): string {
    return JSON.stringify(payload);
  }
}
