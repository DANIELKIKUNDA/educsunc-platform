import type { AbandonsQuery } from 'contexts/bulletins-evaluations/application/queries/AbandonsQuery';
import type { AbandonReadModel } from 'contexts/bulletins-evaluations/application/read-models/AbandonReadModel';
import { PostgresDepotProclamationClasse } from '../depots/PostgresDepotProclamationClasse';
import { ProclamationPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des abandons exposes dans les proclamations.
export class PostgresAbandonsQuery implements AbandonsQuery {
  private readonly depot = new PostgresDepotProclamationClasse();

  // Cette methode relit tous les abandons connus pour une classe et une annee.
  public async executer(idClassePedagogique: string, idAnneeScolaire: string): Promise<AbandonReadModel[]> {
    const proclamations = await this.depot.listerParClasseEtAnnee(idClassePedagogique, idAnneeScolaire);
    return proclamations.flatMap((proclamation) => proclamation.obtenirElevesAbandon().map((abandon) => ProclamationPostgresMapper.versAbandon(abandon)));
  }
}
