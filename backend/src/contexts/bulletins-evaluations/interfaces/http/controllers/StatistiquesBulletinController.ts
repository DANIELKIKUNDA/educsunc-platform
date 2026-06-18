import type { ConsulterAbandonsUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterAbandons/ConsulterAbandonsUseCase';
import type { ConsulterNonClassesUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterNonClasses/ConsulterNonClassesUseCase';
import type { ConsulterStatistiquesClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterStatistiquesClasse/ConsulterStatistiquesClasseUseCase';
import type { ConsulterStatistiquesEcoleUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterStatistiquesEcole/ConsulterStatistiquesEcoleUseCase';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { StatistiquesPresenter } from '../presenters/StatistiquesPresenter';
import { ConsulterStatistiquesValidator } from '../validators/ConsulterStatistiquesValidator';

// Ce controleur expose les endpoints HTTP de statistiques du BC.
export class StatistiquesBulletinController {
  // Ce constructeur injecte les use cases de lecture statistique disponibles.
  constructor(
    private readonly consulterStatistiquesClasseUseCase: ConsulterStatistiquesClasseUseCase,
    private readonly consulterStatistiquesEcoleUseCase: ConsulterStatistiquesEcoleUseCase,
    private readonly consulterNonClassesUseCase: ConsulterNonClassesUseCase,
    private readonly consulterAbandonsUseCase: ConsulterAbandonsUseCase,
  ) {}

  // Cette methode lit les statistiques d'une classe.
  public async consulterClasses(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ConsulterStatistiquesValidator.validerClasse(query, headers);
    const donnees = await this.consulterStatistiquesClasseUseCase.executer(entree);
    return StatistiquesPresenter.presenter(donnees);
  }

  // Cette methode lit les statistiques globales d'une ecole.
  public async consulterEcole(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ConsulterStatistiquesValidator.validerEcole(query, headers);
    const donnees = await this.consulterStatistiquesEcoleUseCase.executer(entree);
    return StatistiquesPresenter.presenter(donnees);
  }

  // Cette methode lit les non classes d'une classe.
  public async consulterNonClasses(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterStatistiquesValidator.validerNonClasses(query, headers);
    const donnees = await this.consulterNonClassesUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les abandons d'une classe.
  public async consulterAbandons(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterStatistiquesValidator.validerAbandons(query, headers);
    const donnees = await this.consulterAbandonsUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }
}
