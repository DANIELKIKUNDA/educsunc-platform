import { Money } from '../../../../domain/value-objects/Money';
import type { PersistancePaiementPostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository calcule les totaux de paiements par caissier.
export class PaiementsParCaissierQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async listerParCaissier(
    idEcole: string,
  ): Promise<ReadonlyArray<{ idCaissier: string; total: Money }>> {
    const lignes = await this.executerRequete<PersistancePaiementPostgres>(
      'SELECT * FROM "paiements" WHERE "id_ecole" = $1',
      [idEcole],
    );
    const totaux = new Map<string, number>();

    lignes.forEach((ligne) => {
      const total = totaux.get(ligne.cree_par) ?? 0;
      totaux.set(ligne.cree_par, total + ligne.montant_total);
    });

    return Array.from(totaux.entries()).map(([idCaissier, total]) => ({
      idCaissier,
      total: new Money(total, 'CDF'),
    }));
  }
}
