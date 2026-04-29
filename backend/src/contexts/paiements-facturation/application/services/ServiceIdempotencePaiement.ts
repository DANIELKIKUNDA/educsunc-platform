import { ErreurPaiementDejaTraite } from '../exceptions/ErreurPaiementDejaTraite';

export interface EnregistrementIdempotencePaiement<TSortie> {
  cleIdempotence: string;
  empreintePayload: string;
  sortie: TSortie;
}

export interface StoreIdempotencePaiement<TSortie = unknown> {
  trouver(cleIdempotence: string): Promise<EnregistrementIdempotencePaiement<TSortie> | null>;
  enregistrer(cleIdempotence: string, empreintePayload: string, sortie: TSortie): Promise<void>;
}

export class ServiceIdempotencePaiement<TSortie = unknown> {
  constructor(private readonly store?: StoreIdempotencePaiement<TSortie>) {}

  public exigerCle(cleIdempotence?: string): string {
    if (cleIdempotence === undefined || cleIdempotence.trim().length === 0) {
      throw new ErreurPaiementDejaTraite('La cle idempotente est obligatoire pour cette commande.');
    }
    return cleIdempotence.trim();
  }

  public creerEmpreintePayload(payload: unknown): string {
    return JSON.stringify(payload);
  }

  public async verifierOuRejouer(cleIdempotence: string, empreintePayload: string): Promise<TSortie | null> {
    const enregistrement = await this.store?.trouver(cleIdempotence);

    if (enregistrement === undefined || enregistrement === null) {
      return null;
    }

    if (enregistrement.empreintePayload !== empreintePayload) {
      throw new ErreurPaiementDejaTraite('La cle idempotente a deja ete utilisee avec un payload different.');
    }

    return enregistrement.sortie;
  }

  public async enregistrer(cleIdempotence: string, empreintePayload: string, sortie: TSortie): Promise<void> {
    await this.store?.enregistrer(cleIdempotence, empreintePayload, sortie);
  }
}
