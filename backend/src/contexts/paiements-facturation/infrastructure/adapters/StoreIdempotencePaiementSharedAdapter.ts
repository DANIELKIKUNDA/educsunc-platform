import type {
  EnregistrementIdempotencePaiement,
  StoreIdempotencePaiement,
} from '../../application/services/ServiceIdempotencePaiement';
import type { IdempotencyStore } from '../../../../shared/infrastructure/idempotency/IdempotencyStore';

// Ce fichier adapte le stockage shared d'idempotence au contrat applicatif du BC Paiements.
export class StoreIdempotencePaiementSharedAdapter<TSortie extends object>
implements StoreIdempotencePaiement<TSortie>
{
  // Ce constructeur injecte le store shared afin d'eviter un stockage technique local au BC.
  constructor(private readonly storeShared: IdempotencyStore) {}

  // Cette methode relit une execution deja memorisee pour la rejouer si le payload est identique.
  public async trouver(
    cleIdempotence: string,
  ): Promise<EnregistrementIdempotencePaiement<TSortie> | null> {
    const enregistrement = await this.storeShared.obtenir(cleIdempotence);

    if (enregistrement === null || enregistrement.resultat === null) {
      return null;
    }

    return {
      cleIdempotence: enregistrement.cle,
      empreintePayload: enregistrement.empreinteRequete ?? '',
      sortie: enregistrement.resultat as unknown as TSortie,
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
      operation: 'PAIEMENT',
      empreinteRequete: empreintePayload,
      resultat: sortie as unknown as Record<string, unknown>,
    });
  }
}
