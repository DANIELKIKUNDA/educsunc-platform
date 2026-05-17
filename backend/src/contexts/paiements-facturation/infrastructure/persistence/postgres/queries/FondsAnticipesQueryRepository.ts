import { Money } from '../../../../domain/value-objects/Money';
import type { PersistanceCaisseJourPostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository lit les montants de fonds anticipes disponibles pour une ecole.
export class FondsAnticipesQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterTotalPourEcole(idEcole: string): Promise<Money> {
    const lignes = await this.executerRequete<PersistanceCaisseJourPostgres>(
      'SELECT * FROM "caisse_jour" WHERE "id_ecole" = $1',
      [idEcole],
    );
    const total = lignes.reduce(
      (courant, ligne) => courant + ligne.total_fonds_anticipes,
      0,
    );

    return new Money(total, 'CDF');
  }
}
