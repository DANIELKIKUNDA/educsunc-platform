import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { EligibilitePerequationQuery } from 'contexts/bulletins-evaluations/application/queries/EligibilitePerequationQuery';
import type { EligibilitePerequationReadModel } from 'contexts/bulletins-evaluations/application/read-models/EligibilitePerequationReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Cette query relit les eligibilites a la perequation depuis les diagnostics du resultat consolide.
export class PostgresEligibilitePerequationQuery implements EligibilitePerequationQuery {
  constructor(
    private readonly depot = new PostgresDepotResultatBulletinEleve(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<EligibilitePerequationReadModel[]> {
    const resultats = await this.depot.listerParClasse(idClassePedagogique, idAnneeScolaire);
    const lignes = await Promise.all(resultats.map(async (resultat): Promise<EligibilitePerequationReadModel | null> => {
      const colonne = resultat.obtenirResultatsColonnes().find((element) => element.obtenirCodeColonne() === codeColonne);
      const diagnostic = resultat.obtenirDiagnosticsEchec().find((element) => element.obtenirCodeColonne() === codeColonne);

      if (colonne === undefined || diagnostic === undefined || colonne.obtenirEstNonClasse()) {
        return null;
      }

      if (!diagnostic.obtenirEligiblePerequation() || diagnostic.obtenirNombreEchecsLegers() <= 0) {
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
        eligiblePerequation: true,
      };
    }));

    return lignes
      .filter((ligne): ligne is EligibilitePerequationReadModel => ligne !== null)
      .sort((a, b) => (a.nombreEchecsLegers - b.nombreEchecsLegers) || ((b.pourcentage ?? 0) - (a.pourcentage ?? 0)));
  }
}
