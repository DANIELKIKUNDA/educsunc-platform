import type { ResultatBulletinOutput } from 'contexts/bulletins-evaluations/application/dto/output/ResultatBulletinOutput';
import type { ResultatsEleveQuery } from 'contexts/bulletins-evaluations/application/queries/ResultatsEleveQuery';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';
import { ResultatBulletinPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des resultats consolides d'un eleve.
export class PostgresResultatsEleveQuery implements ResultatsEleveQuery {
  private readonly depot = new PostgresDepotResultatBulletinEleve();

  // Cette methode retourne la vue lue directement depuis l'agregat de resultat consolide.
  public async executer(idEleve: string, idAnneeScolaire: string): Promise<ResultatBulletinOutput | null> {
    const resultat = await this.depot.trouverParEleveEtAnnee(idEleve, idAnneeScolaire);
    return resultat === null ? null : ResultatBulletinPostgresMapper.versOutput(resultat);
  }
}
