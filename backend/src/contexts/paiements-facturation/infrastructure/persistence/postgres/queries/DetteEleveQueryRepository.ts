// Ce fichier contient le repository de lecture de la dette consolidee d'un eleve.

import type { DetteEleveReadModel } from '../../../../application/read-models/DetteEleveReadModel';
import {
  MappersPaiementsPostgres,
  type PersistanceDetteElevePostgres,
} from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce repository lit la dette consolidee d'un eleve pour les ecrans et rapports.
export class DetteEleveQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  // Ce constructeur injecte le client de lecture PostgreSQL.
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  // Cette methode retourne la dette lisible d'un eleve.
  public async consulterParEleve(
    idEleve: string,
  ): Promise<DetteEleveReadModel | null> {
    const ligne = await this.executerRequeteUnique<PersistanceDetteElevePostgres>(
      'SELECT * FROM "dettes_eleves" WHERE "id_eleve" = $1 LIMIT 1',
      [idEleve],
    );

    if (ligne === null) {
      return null;
    }

    const dette = MappersPaiementsPostgres.depuisPersistanceDette(ligne);

    return {
      idEleve: dette.obtenirIdEleve(),
      totalArrieres: dette.obtenirTotalArrieres(),
      totalAnneeActive: dette.obtenirTotalAnneeActive(),
      totalGlobal: dette.obtenirTotalGlobal(),
      annees: dette.obtenirDettesParAnnee().map((annee) => ({
        idAnneeScolaire: annee.obtenirIdAnneeScolaire(),
        statutAnnee: annee.obtenirStatutAnnee(),
        lignes: annee.obtenirLignes().map((ligneDette) => ({
          idObligation: ligneDette.obtenirIdObligation(),
          typeFrais: ligneDette.obtenirTypeFrais(),
          referenceFrais: ligneDette.obtenirReferenceFrais().obtenirValeur(),
          libelle: ligneDette.obtenirLibelle(),
          montantDuHistorique: ligneDette.obtenirMontantDuHistorique(),
          montantPaye: ligneDette.obtenirMontantPaye(),
          montantExonere: ligneDette.obtenirMontantExonere(),
          solde: ligneDette.obtenirSolde(),
          statut: ligneDette.obtenirStatut(),
        })),
        totalDu: annee.obtenirTotalDu(),
        totalPaye: annee.obtenirTotalPaye(),
        totalExonere: annee.obtenirTotalExonere(),
        soldeRestant: annee.obtenirSoldeRestant(),
      })),
    };
  }
}
