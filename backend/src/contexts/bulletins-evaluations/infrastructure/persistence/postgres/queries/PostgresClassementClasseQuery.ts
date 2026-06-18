import type { ClassementClasseQuery } from 'contexts/bulletins-evaluations/application/queries/ClassementClasseQuery';
import type { ClassementClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel';
import type { DepotClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotClassementColonneClasse';
import { PostgresDepotClassementColonneClasse } from '../depots/PostgresDepotClassementColonneClasse';
import { ClassementPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale d'un classement de classe par colonne.
export class PostgresClassementClasseQuery implements ClassementClasseQuery {
  constructor(
    private readonly depot: DepotClassementColonneClasse = new PostgresDepotClassementColonneClasse(),
  ) {}

  // Cette methode relit le classement deja calcule pour une classe, une annee et une colonne.
  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: string,
  ): Promise<ClassementClasseReadModel | null> {
    const classement = await this.depot.trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);
    return classement === null ? null : ClassementPostgresMapper.versReadModel(classement);
  }
}
