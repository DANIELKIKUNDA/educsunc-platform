import { StatistiquesScolariteReadModel } from '../read-models/StatistiquesScolariteReadModel';

// Ce fichier definit l'unique query applicative des statistiques de scolarite.
export interface GetStatistiquesScolariteQuery {
  idOrganisation: string;
  idEcole?: string;
}

// Ce contrat abstrait la lecture statistique afin de garder l'application independante de SQL.
export interface StatistiquesScolariteQueryRepository {
  /** Calcule les statistiques de scolarite pour une ecole ou une organisation. */
  obtenirStatistiques(
    query: GetStatistiquesScolariteQuery,
  ): Promise<StatistiquesScolariteReadModel>;
}

/**
 * Cette query applicative delegue la projection au repository de lecture sans creer d'agregat.
 */
export class GetStatistiquesScolarite {
  constructor(
    private readonly statistiquesScolariteQueryRepository:
      StatistiquesScolariteQueryRepository,
  ) {}

  /** Execute la lecture statistique avec le meme contrat pour ecole et organisation. */
  public async executer(
    query: GetStatistiquesScolariteQuery,
  ): Promise<StatistiquesScolariteReadModel> {
    return this.statistiquesScolariteQueryRepository.obtenirStatistiques(query);
  }
}
