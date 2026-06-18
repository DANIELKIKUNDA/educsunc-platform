import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { EligibiliteRepechageQuery } from 'contexts/bulletins-evaluations/application/queries/EligibiliteRepechageQuery';
import type { EligibiliteRepechageReadModel } from 'contexts/bulletins-evaluations/application/read-models/EligibiliteRepechageReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Cette query relit les eligibilites au repechage depuis les diagnostics du resultat consolide.
export class PostgresEligibiliteRepechageQuery implements EligibiliteRepechageQuery {
  constructor(
    private readonly depot = new PostgresDepotResultatBulletinEleve(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<EligibiliteRepechageReadModel[]> {
    const resultats = await this.depot.listerParClasse(idClassePedagogique, idAnneeScolaire);
    const lignes = await Promise.all(resultats.map(async (resultat): Promise<EligibiliteRepechageReadModel | null> => {
      const colonne = resultat.obtenirResultatsColonnes().find((element) => element.obtenirCodeColonne() === codeColonne);
      const diagnostic = resultat.obtenirDiagnosticsEchec().find((element) => element.obtenirCodeColonne() === codeColonne);

      if (colonne === undefined || diagnostic === undefined || colonne.obtenirEstNonClasse()) {
        return null;
      }

      if (!diagnostic.obtenirEligibleRepechage() || diagnostic.obtenirNombreEchecs() <= 0) {
        return null;
      }

      const eleve = await this.scolariteElevesPort?.consulterEleve(resultat.obtenirIdEleve());

      return {
        idEleve: resultat.obtenirIdEleve(),
        nomComplet: eleve?.nomComplet ?? resultat.obtenirIdEleve(),
        sexe: eleve?.sexe,
        idClassePedagogique: resultat.obtenirIdClassePedagogique(),
        codeColonne,
        pourcentage: colonne.obtenirPourcentage(),
        rang: colonne.obtenirRang(),
        nombreEchecs: diagnostic.obtenirNombreEchecs(),
        nombreEchecsLegers: diagnostic.obtenirNombreEchecsLegers(),
        nombreEchecsProfonds: diagnostic.obtenirNombreEchecsProfonds(),
        eligibleRepechage: true,
      };
    }));

    return lignes
      .filter((ligne): ligne is EligibiliteRepechageReadModel => ligne !== null)
      .sort((a, b) => (a.nombreEchecs - b.nombreEchecs) || ((b.pourcentage ?? 0) - (a.pourcentage ?? 0)));
  }
}
