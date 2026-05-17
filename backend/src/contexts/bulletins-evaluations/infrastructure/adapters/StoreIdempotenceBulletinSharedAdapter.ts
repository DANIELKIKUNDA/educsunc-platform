import type {
  EnregistrementIdempotence,
  IdempotencyPort,
} from 'contexts/bulletins-evaluations/application/ports/out/IdempotencyPort';
import type { IdempotencyStore } from 'shared/infrastructure/idempotency/IdempotencyStore';

// Ce fichier adapte le stockage shared d'idempotence au contrat applicatif du BC Bulletins.
export class StoreIdempotenceBulletinSharedAdapter<TSortie = unknown>
implements IdempotencyPort<TSortie>
{
  // Ce constructeur injecte le store shared pour eviter toute duplication technique dans le BC.
  constructor(private readonly storeShared: IdempotencyStore) {}

  // Cette methode retrouve une execution deja memorisee pour la rejouer de facon sure.
  public async trouver(cleIdempotence: string): Promise<EnregistrementIdempotence<TSortie> | null> {
    const enregistrement = await this.storeShared.obtenir(cleIdempotence);

    if (enregistrement === null || enregistrement.resultat === null) {
      return null;
    }

    return {
      cleIdempotence: enregistrement.cle,
      empreintePayload: enregistrement.empreinteRequete ?? '',
      sortie: enregistrement.resultat as TSortie,
    };
  }

  // Cette methode memorise le resultat final d'une commande idempotente.
  public async enregistrer(
    cleIdempotence: string,
    empreintePayload: string,
    sortie: TSortie,
  ): Promise<void> {
    await this.storeShared.enregistrer({
      cle: cleIdempotence,
      statut: 'TERMINEE',
      operation: 'BULLETINS_EVALUATIONS',
      empreinteRequete: empreintePayload,
      resultat: sortie as Record<string, unknown>,
    });
  }
}
