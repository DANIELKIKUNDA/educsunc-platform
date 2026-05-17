import { Money } from '../../../../domain/value-objects/Money';
import type { HistoriquePaiementsEleveReadModel } from '../../../../application/read-models/HistoriquePaiementsEleveReadModel';
import type { PersistancePaiementPostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository retourne l'historique des paiements d'un eleve.
export class HistoriquePaiementsEleveQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterParEleve(
    idEleve: string,
  ): Promise<HistoriquePaiementsEleveReadModel> {
    const lignes = await this.executerRequete<PersistancePaiementPostgres>(
      [
        'SELECT * FROM "paiements"',
        'WHERE "id_eleve" = $1',
        'ORDER BY "cree_le" DESC',
      ].join(' '),
      [idEleve],
    );

    return {
      idEleve,
      paiements: lignes.map((ligne) => ({
        idPaiement: ligne.id,
        creeLe: new Date(ligne.cree_le),
        montantTotal: new Money(ligne.montant_total, ligne.devise),
        modePaiement: ligne.mode_paiement,
        typeFraisDeclare: ligne.type_frais_declare,
        statutPaiement: ligne.statut_paiement,
      })),
    };
  }
}
