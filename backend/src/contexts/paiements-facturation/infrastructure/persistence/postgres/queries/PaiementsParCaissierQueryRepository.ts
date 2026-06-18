import { Money } from '../../../../domain/value-objects/Money';
import type { PaiementsParCaissierReadModel } from '../../../../application/read-models/PaiementsParCaissierReadModel';
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
    dateDebut?: string,
    dateFin?: string,
  ): Promise<PaiementsParCaissierReadModel> {
    const clauses = ['"id_ecole" = $1'];
    const parametres: unknown[] = [idEcole];

    if (dateDebut !== undefined) {
      clauses.push(`DATE("cree_le") >= $${parametres.length + 1}`);
      parametres.push(dateDebut);
    }

    if (dateFin !== undefined) {
      clauses.push(`DATE("cree_le") <= $${parametres.length + 1}`);
      parametres.push(dateFin);
    }

    const lignes = await this.executerRequete<PersistancePaiementPostgres>(
      `SELECT * FROM "paiements" WHERE ${clauses.join(' AND ')}`,
      parametres,
    );
    const totaux = new Map<string, number>();

    lignes.forEach((ligne) => {
      const total = totaux.get(ligne.cree_par) ?? 0;
      totaux.set(ligne.cree_par, total + ligne.montant_total);
    });

    return {
      idEcole,
      dateDebut,
      dateFin,
      lignes: Array.from(totaux.entries()).map(([idCaissier, total]) => ({
        idCaissier,
        total: new Money(total, 'CDF'),
      })),
    };
  }
}
