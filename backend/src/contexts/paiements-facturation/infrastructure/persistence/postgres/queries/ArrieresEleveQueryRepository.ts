import { Money } from '../../../../domain/value-objects/Money';
import type { ArrieresEleveReadModel } from '../../../../application/read-models/ArrieresEleveReadModel';
import type { PersistanceDetteElevePostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository lit uniquement la partie arrieres de la dette consolidee.
export class ArrieresEleveQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterParEleve(idEcole: string, idEleve: string): Promise<ArrieresEleveReadModel> {
    const ligne = await this.executerRequeteUnique<PersistanceDetteElevePostgres>(
      'SELECT * FROM "dettes_eleves" WHERE "id_ecole" = $1 AND "id_eleve" = $2 LIMIT 1',
      [idEcole, idEleve],
    );

    if (ligne === null) {
      return {
        idEleve,
        totalArrieres: new Money(0, 'CDF'),
      };
    }

    return {
      idEleve,
      totalArrieres: new Money(
        ligne.total_arrieres.montant,
        ligne.total_arrieres.devise,
      ),
    };
  }
}
