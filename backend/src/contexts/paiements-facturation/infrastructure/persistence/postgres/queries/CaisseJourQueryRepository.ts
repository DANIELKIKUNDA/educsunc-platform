import { Money } from '../../../../domain/value-objects/Money';
import type { CaisseJourReadModel } from '../../../../application/read-models/CaisseJourReadModel';
import type { PersistanceCaisseJourPostgres, PersistanceOperationCaissePostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository retourne une vue de caisse exploitable par les tableaux de bord.
export class CaisseJourQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterParEcoleEtDate(
    idEcole: string,
    date: string,
  ): Promise<CaisseJourReadModel | null> {
    const ligne = await this.executerRequeteUnique<PersistanceCaisseJourPostgres>(
      [
        'SELECT * FROM "caisse_jour"',
        'WHERE "id_ecole" = $1 AND "date_caisse" = $2',
        'LIMIT 1',
      ].join(' '),
      [idEcole, date],
    );

    if (ligne === null) {
      return null;
    }

    const operations =
      await this.executerRequete<PersistanceOperationCaissePostgres>(
        'SELECT * FROM "operations_caisse" WHERE "id_caisse_jour" = $1',
        [ligne.id],
      );

    const devise = 'CDF';
    const totauxParType = new Map<string, number>();

    operations.forEach((operation) => {
      const totalCourant = totauxParType.get(operation.type_operation) ?? 0;
      totauxParType.set(operation.type_operation, totalCourant + operation.montant);
    });

    return {
      idEcole: ligne.id_ecole,
      date: ligne.date_caisse,
      totalEncaisse: new Money(ligne.total_encaisse, devise),
      totalCash: new Money(ligne.total_cash, devise),
      totalMobileMoney: new Money(ligne.total_mobile_money, devise),
      totalParCaissier: (ligne.total_par_caissier ?? []).map((element) => ({
        idCaissier: element.idCaissier,
        total: new Money(element.montant.montant, element.montant.devise),
      })),
      totalParTypeFrais: Array.from(totauxParType.entries()).map(([typeFrais, total]) => ({
        typeFrais: typeFrais as never,
        total: new Money(total, devise),
      })),
      totalFondsAnticipes: new Money(ligne.total_fonds_anticipes, devise),
      totalFondsConsommes: new Money(ligne.total_fonds_consommes, devise),
      disponibleReel: new Money(ligne.disponible_reel, devise),
    };
  }
}
