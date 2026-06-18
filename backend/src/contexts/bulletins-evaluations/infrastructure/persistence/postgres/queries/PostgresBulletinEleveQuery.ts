import type { BulletinEleveQuery } from 'contexts/bulletins-evaluations/application/queries/BulletinEleveQuery';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { PostgresDepotBulletinEleve } from '../depots/PostgresDepotBulletinEleve';
import { BulletinPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale d'un bulletin d'eleve a partir du depot du BC.
export class PostgresBulletinEleveQuery implements BulletinEleveQuery {
  private readonly depot = new PostgresDepotBulletinEleve();

  // Cette methode relit le bulletin actif d'un eleve pour une annee scolaire donnee.
  public async executer(idEleve: string, idAnneeScolaire: string): Promise<BulletinEleveReadModel | null> {
    const bulletin = await this.depot.trouverParEleveEtAnnee(idEleve, idAnneeScolaire);
    return bulletin === null ? null : BulletinPostgresMapper.versReadModel(bulletin);
  }

  public async executerParId(idBulletinEleve: string): Promise<BulletinEleveReadModel | null> {
    const bulletin = await this.depot.trouverParId(idBulletinEleve);
    return bulletin === null ? null : BulletinPostgresMapper.versReadModel(bulletin);
  }
}
