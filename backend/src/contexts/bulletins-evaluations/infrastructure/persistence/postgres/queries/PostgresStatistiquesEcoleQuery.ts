import type { StatistiquesEcoleQuery } from 'contexts/bulletins-evaluations/application/queries/StatistiquesEcoleQuery';
import type { StatistiquesEcoleReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesEcoleReadModel';
import { PostgresDepotSyntheseResultatsEcole } from '../depots/PostgresDepotSyntheseResultatsEcole';
import { obtenirMemoireTechniqueBulletins } from '../depots/outilsDepotBulletin';
import { SynthesePostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des statistiques globales d'une ecole.
export class PostgresStatistiquesEcoleQuery implements StatistiquesEcoleQuery {
  private readonly depot = new PostgresDepotSyntheseResultatsEcole();

  // Cette methode relit les totaux d'ecole depuis la synthese deja generee.
  public async executer(idEcole: string, idAnneeScolaire: string, codeColonne: string): Promise<StatistiquesEcoleReadModel | null> {
    const synthese = await this.depot.trouverParEcoleEtColonne(idEcole, codeColonne, idAnneeScolaire);
    const statistiques = SynthesePostgresMapper.versStatistiques(synthese?.obtenirTotauxSyntheseEcole()) as StatistiquesEcoleReadModel | undefined;

    if (statistiques !== undefined) {
      obtenirMemoireTechniqueBulletins().projectionsStatistiques.set(
        `${idEcole}:${idAnneeScolaire}:${codeColonne}:ecole`,
        statistiques,
      );
    }

    return statistiques ?? null;
  }
}
