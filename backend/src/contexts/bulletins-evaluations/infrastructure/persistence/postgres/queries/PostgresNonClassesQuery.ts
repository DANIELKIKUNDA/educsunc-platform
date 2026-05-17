import type { NonClassesQuery } from 'contexts/bulletins-evaluations/application/queries/NonClassesQuery';
import type { NonClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/NonClasseReadModel';
import { PostgresDepotProclamationClasse } from '../depots/PostgresDepotProclamationClasse';
import { ProclamationPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des eleves declares non classes.
export class PostgresNonClassesQuery implements NonClassesQuery {
  private readonly depot = new PostgresDepotProclamationClasse();

  // Cette methode relit les non classes depuis la proclamation deja produite.
  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: string,
  ): Promise<NonClasseReadModel[]> {
    const proclamation = await this.depot.trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);
    return proclamation?.obtenirElevesNonClasses().map((nonClasse) => ProclamationPostgresMapper.versNonClasse(nonClasse)) ?? [];
  }
}
