import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { ConduiteClasseQuery } from 'contexts/bulletins-evaluations/application/queries/ConduiteClasseQuery';
import type { ConduiteClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ConduiteClasseReadModel';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Cette query expose la liste de conduite d'une classe a partir des resultats consolides.
export class PostgresConduiteClasseQuery implements ConduiteClasseQuery {
  constructor(
    private readonly depotResultat: DepotResultatBulletinEleve = new PostgresDepotResultatBulletinEleve(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  public async executer(idClassePedagogique: string, idAnneeScolaire: string): Promise<ConduiteClasseReadModel> {
    const resultats = await this.depotResultat.listerParClasse(idClassePedagogique, idAnneeScolaire);
    const lignes = await Promise.all(resultats.map(async (resultat) => {
      const eleve = await this.scolariteElevesPort?.consulterEleve(resultat.obtenirIdEleve());
      const applications = resultat.obtenirApplicationsPeriodes();
      const conduites = resultat.obtenirConduitesPeriodes();
      const codesPeriodes = new Set([
        ...applications.map((application) => application.obtenirCodePeriode()),
        ...conduites.map((conduite) => conduite.obtenirCodePeriode()),
      ]);

      return {
        idResultatBulletinEleve: resultat.obtenirId(),
        idEleve: resultat.obtenirIdEleve(),
        nomComplet: eleve?.nomComplet ?? resultat.obtenirIdEleve(),
        sexe: eleve?.sexe,
        applications: [...codesPeriodes].map((codePeriode) => {
          const application = applications.find((element) => element.obtenirCodePeriode() === codePeriode);
          const conduite = conduites.find((element) => element.obtenirCodePeriode() === codePeriode);

          return {
            codePeriode,
            application: application?.obtenirMentionApplication(),
            conduite: conduite?.obtenirMentionConduite(),
            pointsConduite: conduite?.obtenirPointsConduite(),
          };
        }),
      };
    }));

    return {
      idClassePedagogique,
      idAnneeScolaire,
      lignes: lignes.sort((a, b) => a.nomComplet.localeCompare(b.nomComplet, 'fr')),
    };
  }
}
