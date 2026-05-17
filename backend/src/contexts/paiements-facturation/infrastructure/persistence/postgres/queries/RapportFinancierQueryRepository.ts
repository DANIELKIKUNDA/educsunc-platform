import { Money } from '../../../../domain/value-objects/Money';
import type { RapportFinancierReadModel } from '../../../../application/read-models/RapportFinancierReadModel';
import type { PersistanceOperationCaissePostgres, PersistanceRestitutionPostgres, PersistancePaiementPostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository calcule des rapports financiers agreges sans toucher au domaine metier.
export class RapportFinancierQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterRapportJournalier(
    idEcole: string,
    date: string,
  ): Promise<RapportFinancierReadModel> {
    const paiements = await this.executerRequete<PersistancePaiementPostgres>(
      [
        'SELECT * FROM "paiements"',
        'WHERE "id_ecole" = $1 AND DATE("cree_le") = $2',
      ].join(' '),
      [idEcole, date],
    );
    const operations =
      await this.executerRequete<PersistanceOperationCaissePostgres>(
        [
          'SELECT "op".*',
          'FROM "operations_caisse" "op"',
          'JOIN "caisse_jour" "cj" ON "cj"."id" = "op"."id_caisse_jour"',
          'WHERE "cj"."id_ecole" = $1 AND "cj"."date_caisse" = $2',
        ].join(' '),
        [idEcole, date],
      );
    const restitutions = await this.executerRequete<PersistanceRestitutionPostgres>(
      [
        'SELECT * FROM "restitutions"',
        'WHERE "id_ecole" = $1 AND DATE("effectue_le") = $2',
      ].join(' '),
      [idEcole, date],
    );

    const totalEncaisse = paiements.reduce(
      (total, paiement) => total + paiement.montant_total,
      0,
    );
    const totalRestitue = restitutions.reduce(
      (total, restitution) => total + restitution.montant,
      0,
    );
    const totalAnnule = operations
      .filter((operation) => operation.id_annulation !== null)
      .reduce((total, operation) => total + operation.montant, 0);
    const totalAnticipe = 0;
    const totalConsomme = totalEncaisse - totalAnnule - totalRestitue;

    return {
      periode: date,
      totalEncaisse: new Money(totalEncaisse, 'CDF'),
      totalConsomme: new Money(Math.max(totalConsomme, 0), 'CDF'),
      totalAnticipe: new Money(totalAnticipe, 'CDF'),
      totalRestitue: new Money(totalRestitue, 'CDF'),
      totalAnnule: new Money(totalAnnule, 'CDF'),
    };
  }
}
