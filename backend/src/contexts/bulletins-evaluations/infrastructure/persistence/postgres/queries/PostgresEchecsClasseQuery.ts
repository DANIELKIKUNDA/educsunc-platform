import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { EchecsClasseQuery } from 'contexts/bulletins-evaluations/application/queries/EchecsClasseQuery';
import type { EleveEchecReadModel } from 'contexts/bulletins-evaluations/application/read-models/EleveEchecReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Cette query relit les eleves en echec d'une classe depuis les resultats consolides.
export class PostgresEchecsClasseQuery implements EchecsClasseQuery {
  constructor(
    private readonly depot = new PostgresDepotResultatBulletinEleve(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
    options?: { profondsSeulement?: boolean },
  ): Promise<EleveEchecReadModel[]> {
    const resultats = await this.depot.listerParClasse(idClassePedagogique, idAnneeScolaire);
    const lignes = await Promise.all(resultats.map(async (resultat): Promise<EleveEchecReadModel | null> => {
      const colonne = resultat.obtenirResultatsColonnes().find((element) => element.obtenirCodeColonne() === codeColonne);
      const diagnostic = resultat.obtenirDiagnosticsEchec().find((element) => element.obtenirCodeColonne() === codeColonne);

      if (colonne === undefined || diagnostic === undefined || colonne.obtenirEstNonClasse()) {
        return null;
      }

      if (options?.profondsSeulement === true && diagnostic.obtenirNombreEchecsProfonds() <= 0) {
        return null;
      }

      if (options?.profondsSeulement !== true && diagnostic.obtenirNombreEchecs() <= 0) {
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
        nombreEchecsProfonds: diagnostic.obtenirNombreEchecsProfonds(),
        eligiblePerequation: diagnostic.obtenirEligiblePerequation(),
        eligibleRepechage: diagnostic.obtenirEligibleRepechage(),
      };
    }));

    return lignes
      .filter((ligne): ligne is EleveEchecReadModel => ligne !== null)
      .sort((a, b) => (b.nombreEchecsProfonds - a.nombreEchecsProfonds) || (b.nombreEchecs - a.nombreEchecs));
  }
}
