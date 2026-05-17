import type { AbandonsQuery } from 'contexts/bulletins-evaluations/application/queries/AbandonsQuery';
import type { NonClassesQuery } from 'contexts/bulletins-evaluations/application/queries/NonClassesQuery';
import type { StatistiquesClasseQuery } from 'contexts/bulletins-evaluations/application/queries/StatistiquesClasseQuery';
import type { StatistiquesEcoleQuery } from 'contexts/bulletins-evaluations/application/queries/StatistiquesEcoleQuery';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { StatistiquesPresenter } from '../presenters/StatistiquesPresenter';

// Ce controleur expose les endpoints HTTP de statistiques du BC.
export class StatistiquesBulletinController {
  // Ce constructeur injecte les queries de lecture statistique disponibles.
  constructor(
    private readonly statistiquesClasseQuery: StatistiquesClasseQuery,
    private readonly statistiquesEcoleQuery: StatistiquesEcoleQuery,
    private readonly nonClassesQuery: NonClassesQuery,
    private readonly abandonsQuery: AbandonsQuery,
  ) {}

  // Cette methode lit les statistiques d'une classe.
  public async consulterClasses(query: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string }): Promise<{ donnee: unknown }> {
    const donnees = await this.statistiquesClasseQuery.executer(query.idClassePedagogique, query.idAnneeScolaire, query.codeColonne);
    return StatistiquesPresenter.presenter(donnees);
  }

  // Cette methode lit les statistiques globales d'une ecole.
  public async consulterEcole(query: { idEcole: string; idAnneeScolaire: string; codeColonne: string }): Promise<{ donnee: unknown }> {
    const donnees = await this.statistiquesEcoleQuery.executer(query.idEcole, query.idAnneeScolaire, query.codeColonne);
    return StatistiquesPresenter.presenter(donnees);
  }

  // Cette methode lit les non classes d'une classe.
  public async consulterNonClasses(query: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string }): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const donnees = await this.nonClassesQuery.executer(query.idClassePedagogique, query.idAnneeScolaire, query.codeColonne);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les abandons d'une classe.
  public async consulterAbandons(query: { idClassePedagogique: string; idAnneeScolaire: string }): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const donnees = await this.abandonsQuery.executer(query.idClassePedagogique, query.idAnneeScolaire);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }
}
