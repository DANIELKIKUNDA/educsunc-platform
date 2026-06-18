import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { ComparatifClassesQuery } from 'contexts/bulletins-evaluations/application/queries/ComparatifClassesQuery';
import type { StatistiquesClasseQuery } from 'contexts/bulletins-evaluations/application/queries/StatistiquesClasseQuery';
import type { ComparatifClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ComparatifClasseReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Cette query compose un comparatif de classes a partir des statistiques deja consolidees.
export class PostgresComparatifClassesQuery implements ComparatifClassesQuery {
  constructor(
    private readonly statistiquesClasseQuery: StatistiquesClasseQuery,
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  public async executer(
    idClassesPedagogiques: string[],
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<ComparatifClasseReadModel[]> {
    const lignes = await Promise.all(idClassesPedagogiques.map(async (idClassePedagogique) => {
      const statistiques = await this.statistiquesClasseQuery.executer(
        idClassePedagogique,
        idAnneeScolaire,
        codeColonne,
      );

      if (statistiques === null) {
        return null;
      }

      const classe = await this.scolariteElevesPort?.consulterClassePedagogique(idClassePedagogique);

      return {
        idClassePedagogique,
        libelleClasse: classe?.libelleClasse ?? idClassePedagogique,
        codeColonne,
        participantsTotal: statistiques.participantsTotal,
        classesTotal: statistiques.classesTotal,
        nonClassesTotal: statistiques.nonClassesTotal,
        abandonsTotal: statistiques.abandonsTotal,
        tauxReussite: statistiques.tauxReussite,
        tauxEchec: statistiques.tauxEchec,
      } satisfies ComparatifClasseReadModel;
    }));

    return lignes
      .filter((ligne): ligne is ComparatifClasseReadModel => ligne !== null)
      .sort((a, b) => b.tauxReussite - a.tauxReussite);
  }
}
