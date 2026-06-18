import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import type { DepotSyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/repositories/DepotSyntheseResultatsEcole';
import type { SyntheseResultatsEcoleQuery } from 'contexts/bulletins-evaluations/application/queries/SyntheseResultatsEcoleQuery';
import { PostgresDepotSyntheseResultatsEcole } from '../depots/PostgresDepotSyntheseResultatsEcole';
import { SynthesePostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale d'une synthese globale de resultats d'ecole.
export class PostgresSyntheseResultatsEcoleQuery implements SyntheseResultatsEcoleQuery {
  constructor(
    private readonly depot: DepotSyntheseResultatsEcole = new PostgresDepotSyntheseResultatsEcole(),
  ) {}

  // Cette methode relit la synthese deja consolidee pour une ecole et une colonne.
  public async executer(idEcole: string, idAnneeScolaire: string, codeColonne: string): Promise<SyntheseEcoleOutput | null> {
    const synthese = await this.depot.trouverParEcoleEtColonne(idEcole, codeColonne, idAnneeScolaire);
    return synthese === null ? null : SynthesePostgresMapper.versOutput(synthese);
  }
}
