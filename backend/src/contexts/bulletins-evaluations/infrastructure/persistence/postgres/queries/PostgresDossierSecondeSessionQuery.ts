import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { DossierSecondeSessionQuery } from 'contexts/bulletins-evaluations/application/queries/DossierSecondeSessionQuery';
import type { DossierSecondeSessionReadModel } from 'contexts/bulletins-evaluations/application/read-models/DossierSecondeSessionReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Cette query relit les dossiers de seconde session depuis les diagnostics consolides.
export class PostgresDossierSecondeSessionQuery implements DossierSecondeSessionQuery {
  constructor(
    private readonly depot = new PostgresDepotResultatBulletinEleve(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<DossierSecondeSessionReadModel[]> {
    const resultats = await this.depot.listerParClasse(idClassePedagogique, idAnneeScolaire);
    const lignes = await Promise.all(resultats.map(async (resultat): Promise<DossierSecondeSessionReadModel | null> => {
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
        eligiblePerequation: diagnostic.obtenirEligiblePerequation(),
        eligibleRepechage: diagnostic.obtenirEligibleRepechage(),
        commentaireTechnique: diagnostic.obtenirCommentaireTechnique(),
      };
    }));

    return lignes
      .filter((ligne): ligne is DossierSecondeSessionReadModel => ligne !== null)
      .sort((a, b) => (a.nombreEchecs - b.nombreEchecs) || ((b.pourcentage ?? 0) - (a.pourcentage ?? 0)));
  }
}
