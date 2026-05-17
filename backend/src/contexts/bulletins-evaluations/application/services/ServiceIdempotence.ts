import { IdempotencyException } from '../exceptions/IdempotencyException';
import type { EnregistrementIdempotence, IdempotencyPort } from '../ports/out/IdempotencyPort';

// Ce service centralise l'idempotence applicative des commandes du BC.
export class ServiceIdempotence<TSortie = unknown> {
  constructor(private readonly port?: IdempotencyPort<TSortie>) {}

  // Cette methode exige une cle idempotente quand la commande la fournit.
  public exigerCle(cleIdempotence?: string): string | undefined {
    if (cleIdempotence === undefined) {
      return undefined;
    }

    if (cleIdempotence.trim().length === 0) {
      throw new IdempotencyException('La cle idempotente fournie est vide.');
    }

    return cleIdempotence.trim();
  }

  // Cette methode construit une empreinte stable d'un payload applicatif.
  public creerEmpreintePayload(payload: unknown): string {
    return JSON.stringify(payload);
  }

  // Cette methode relit une execution precedente et verifie la compatibilite du payload.
  public async verifierOuRejouer(
    cleIdempotence?: string,
    empreintePayload?: string,
  ): Promise<TSortie | null> {
    if (cleIdempotence === undefined || empreintePayload === undefined) {
      return null;
    }

    const enregistrement = await this.port?.trouver(cleIdempotence);
    if (enregistrement === undefined || enregistrement === null) {
      return null;
    }

    this.verifierEmpreinte(enregistrement, empreintePayload);
    return enregistrement.sortie;
  }

  // Cette methode enregistre une execution idempotente reussie.
  public async enregistrer(cleIdempotence: string | undefined, empreintePayload: string | undefined, sortie: TSortie): Promise<void> {
    if (cleIdempotence === undefined || empreintePayload === undefined) {
      return;
    }

    await this.port?.enregistrer(cleIdempotence, empreintePayload, sortie);
  }

  // Cette methode valide la coherence entre cle et payload deja traite.
  private verifierEmpreinte(enregistrement: EnregistrementIdempotence<TSortie>, empreintePayload: string): void {
    if (enregistrement.empreintePayload !== empreintePayload) {
      throw new IdempotencyException('La cle idempotente a deja ete utilisee avec un payload different.');
    }
  }
}
