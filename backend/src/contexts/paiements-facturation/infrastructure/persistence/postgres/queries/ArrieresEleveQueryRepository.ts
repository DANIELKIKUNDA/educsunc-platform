import { Money } from '../../../../domain/value-objects/Money';
import type { PersistanceDetteElevePostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository lit uniquement la partie arrieres de la dette consolidee.
export class ArrieresEleveQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterMontant(idEleve: string): Promise<Money> {
    const ligne = await this.executerRequeteUnique<PersistanceDetteElevePostgres>(
      'SELECT * FROM "dettes_eleves" WHERE "id_eleve" = $1 LIMIT 1',
      [idEleve],
    );

    if (ligne === null) {
      return new Money(0, 'CDF');
    }

    return new Money(
      ligne.total_arrieres.montant,
      ligne.total_arrieres.devise,
    );
  }
}
