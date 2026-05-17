import type { ProclamationClasseQuery } from 'contexts/bulletins-evaluations/application/queries/ProclamationClasseQuery';
import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import { PostgresDepotProclamationClasse } from '../depots/PostgresDepotProclamationClasse';
import { ProclamationPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale d'une proclamation complete de classe.
export class PostgresProclamationClasseQuery implements ProclamationClasseQuery {
  private readonly depot = new PostgresDepotProclamationClasse();

  // Cette methode relit la proclamation officielle deja produite pour la classe concernee.
  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: string,
  ): Promise<ProclamationClasseReadModel | null> {
    const proclamation = await this.depot.trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);
    return proclamation === null ? null : ProclamationPostgresMapper.versReadModel(proclamation);
  }
}
