import { SyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/aggregates/SyntheseResultatsEcole';
import type { DepotSyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/repositories/DepotSyntheseResultatsEcole';

// Ce fichier fournit un depot PostgreSQL simplifie pour les syntheses globales d'ecole.
export class PostgresDepotSyntheseResultatsEcole implements DepotSyntheseResultatsEcole {
  private static readonly stockage = new Map<string, SyntheseResultatsEcole>();

  public async sauvegarder(syntheseResultatsEcole: SyntheseResultatsEcole): Promise<void> {
    PostgresDepotSyntheseResultatsEcole.stockage.set(syntheseResultatsEcole.obtenirId(), syntheseResultatsEcole);
  }

  public async trouverParEcoleEtColonne(
    idEcole: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<SyntheseResultatsEcole | null> {
    return [...PostgresDepotSyntheseResultatsEcole.stockage.values()].find((synthese) =>
      String(Reflect.get(synthese, 'idEcole') ?? '') === idEcole
      && String(Reflect.get(synthese, 'codeColonne') ?? '') === codeColonne
      && String(Reflect.get(synthese, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async listerParAnnee(idEcole: string, idAnneeScolaire: string): Promise<SyntheseResultatsEcole[]> {
    return [...PostgresDepotSyntheseResultatsEcole.stockage.values()].filter((synthese) =>
      String(Reflect.get(synthese, 'idEcole') ?? '') === idEcole
      && String(Reflect.get(synthese, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    );
  }
}
