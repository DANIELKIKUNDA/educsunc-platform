import { Money } from '../../../../domain/value-objects/Money';
import type { PersistancePaiementPostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository agrege les paiements par type de frais declare.
export class PaiementsParTypeFraisQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async listerParType(
    idEcole: string,
  ): Promise<ReadonlyArray<{ typeFrais: string; total: Money }>> {
    const lignes = await this.executerRequete<PersistancePaiementPostgres>(
      'SELECT * FROM "paiements" WHERE "id_ecole" = $1',
      [idEcole],
    );
    const totaux = new Map<string, number>();

    lignes.forEach((ligne) => {
      const total = totaux.get(ligne.type_frais_declare) ?? 0;
      totaux.set(ligne.type_frais_declare, total + ligne.montant_total);
    });

    return Array.from(totaux.entries()).map(([typeFrais, total]) => ({
      typeFrais,
      total: new Money(total, 'CDF'),
    }));
  }
}
