import { Money } from '../../../../domain/value-objects/Money';
import { OrigineAffectation } from '../../../../domain/value-objects/OrigineAffectation';
import type { FondsAnticipesReadModel } from '../../../../application/read-models/FondsAnticipesReadModel';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

interface LigneFondsAnticipesPostgres {
  origine_affectation: string;
  total: number;
}

// Ce repository agrege les fonds anticipes reels a partir des repartitions de paiements.
export class FondsAnticipesQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async consulter(
    idEcole: string,
    dateDebut?: string,
    dateFin?: string,
    idsElevesAutorises?: readonly string[],
  ): Promise<FondsAnticipesReadModel> {
    const clauses = [
      '"paiement"."id_ecole" = $1',
      `"repartition"."origine_affectation" = ANY($2)`,
      `"paiement"."statut_paiement" <> 'ANNULE'`,
    ];
    const parametres: unknown[] = [
      idEcole,
      [OrigineAffectation.ANTICIPE, OrigineAffectation.LISSAGE],
    ];

    if (dateDebut !== undefined) {
      clauses.push(`DATE("paiement"."cree_le") >= $${parametres.length + 1}`);
      parametres.push(dateDebut);
    }

    if (dateFin !== undefined) {
      clauses.push(`DATE("paiement"."cree_le") <= $${parametres.length + 1}`);
      parametres.push(dateFin);
    }

    if (idsElevesAutorises !== undefined) {
      if (idsElevesAutorises.length === 0) {
        return {
          idEcole,
          dateDebut,
          dateFin,
          totalFondsAnticipes: new Money(0, 'CDF'),
          lignes: [],
        };
      }

      clauses.push(`"paiement"."id_eleve" = ANY($${parametres.length + 1})`);
      parametres.push(idsElevesAutorises);
    }

    const lignes = await this.executerRequete<LigneFondsAnticipesPostgres>(
      [
        'SELECT',
        '"repartition"."origine_affectation",',
        'SUM("repartition"."montant")::integer AS "total"',
        'FROM "repartitions_paiement" "repartition"',
        'JOIN "paiements" "paiement" ON "paiement"."id" = "repartition"."id_paiement"',
        `WHERE ${clauses.join(' AND ')}`,
        'GROUP BY "repartition"."origine_affectation"',
      ].join(' '),
      parametres,
    );
    const totalFondsAnticipes = lignes.reduce(
      (courant, ligne) => courant + ligne.total,
      0,
    );

    return {
      idEcole,
      dateDebut,
      dateFin,
      totalFondsAnticipes: new Money(totalFondsAnticipes, 'CDF'),
      lignes: lignes.map((ligne) => ({
        origineAffectation: ligne.origine_affectation,
        total: new Money(ligne.total, 'CDF'),
      })),
    };
  }
}
