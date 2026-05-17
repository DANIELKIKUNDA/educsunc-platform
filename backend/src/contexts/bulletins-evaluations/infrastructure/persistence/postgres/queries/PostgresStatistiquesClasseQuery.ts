import type { StatistiquesClasseQuery } from 'contexts/bulletins-evaluations/application/queries/StatistiquesClasseQuery';
import type { StatistiquesClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesClasseReadModel';
import { PostgresDepotProclamationClasse } from '../depots/PostgresDepotProclamationClasse';
import { obtenirMemoireTechniqueBulletins } from '../depots/outilsDepotBulletin';
import { ProclamationPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des statistiques d'une classe pour une colonne.
export class PostgresStatistiquesClasseQuery implements StatistiquesClasseQuery {
  private readonly depot = new PostgresDepotProclamationClasse();

  // Cette methode relit les statistiques directement depuis la proclamation existante.
  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: string,
  ): Promise<StatistiquesClasseReadModel | null> {
    const proclamation = await this.depot.trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);
    const statistiques = ProclamationPostgresMapper.versStatistiques(proclamation?.obtenirStatistiquesProclamation()) as StatistiquesClasseReadModel | undefined;

    if (statistiques !== undefined) {
      obtenirMemoireTechniqueBulletins().projectionsStatistiques.set(
        `${idClassePedagogique}:${idAnneeScolaire}:${codeColonne}:classe`,
        statistiques,
      );
    }

    return statistiques ?? null;
  }
}
