import { Money } from '../../../../domain/value-objects/Money';
import type { FraisExigiblesEleveReadModel } from '../../../../application/read-models/FraisExigiblesEleveReadModel';
import type { PersistanceObligationFinancierePostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository retourne seulement les frais encore exigibles pour un eleve.
export class FraisExigiblesEleveQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulterParEleve(
    idEleve: string,
  ): Promise<FraisExigiblesEleveReadModel> {
    const lignes = await this.executerRequete<PersistanceObligationFinancierePostgres>(
      [
        'SELECT * FROM "obligations_financieres"',
        'WHERE "id_eleve" = $1',
        'AND "solde" > 0',
        'AND "statut" <> $2',
        'ORDER BY "cree_le" ASC',
      ].join(' '),
      [idEleve, 'ANNULE'],
    );

    return {
      idEleve,
      frais: lignes.map((ligne) => ({
        typeFrais: ligne.type_frais,
        libelle: ligne.libelle,
        montantAttendu: new Money(ligne.montant_initial, ligne.devise),
        resteAPayer: new Money(ligne.solde, ligne.devise),
        paiementPartielAutorise: ligne.solde < ligne.montant_initial,
      })),
    };
  }
}
