import { Money } from '../../../../domain/value-objects/Money';
import type { PaiementsParTypeFraisReadModel } from '../../../../application/read-models/PaiementsParTypeFraisReadModel';
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
    dateDebut?: string,
    dateFin?: string,
    idsElevesAutorises?: readonly string[],
  ): Promise<PaiementsParTypeFraisReadModel> {
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

    if (idsElevesAutorises !== undefined) {
      if (idsElevesAutorises.length === 0) {
        return {
          idEcole,
          dateDebut,
          dateFin,
          lignes: [],
        };
      }

      clauses.push(`"id_eleve" = ANY($${parametres.length + 1})`);
      parametres.push(idsElevesAutorises);
    }

    const lignes = await this.executerRequete<PersistancePaiementPostgres>(
      `SELECT * FROM "paiements" WHERE ${clauses.join(' AND ')}`,
      parametres,
    );
    const totaux = new Map<string, number>();

    lignes.forEach((ligne) => {
      const total = totaux.get(ligne.type_frais_declare) ?? 0;
      totaux.set(ligne.type_frais_declare, total + ligne.montant_total);
    });

    return {
      idEcole,
      dateDebut,
      dateFin,
      lignes: Array.from(totaux.entries()).map(([typeFrais, total]) => ({
        typeFrais,
        total: new Money(total, 'CDF'),
      })),
    };
  }
}
