import type { HistoriqueMigrationQuery } from 'contexts/bulletins-evaluations/application/queries/HistoriqueMigrationQuery';
import type { AppliquerMigrationBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/AppliquerMigrationBulletin/AppliquerMigrationBulletinUseCase';
import type { GenererMigrationBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererMigrationBulletin/GenererMigrationBulletinUseCase';
import { MigrationPresenter } from '../presenters/MigrationPresenter';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { MigrationBulletinValidator } from '../validators/MigrationBulletinValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP lies aux migrations de bulletin.
export class MigrationBulletinController {
  // Ce constructeur injecte les cas d'usage de migration et la query d'historique documentaire.
  constructor(
    private readonly genererMigrationBulletinUseCase: GenererMigrationBulletinUseCase,
    private readonly appliquerMigrationBulletinUseCase: AppliquerMigrationBulletinUseCase,
    private readonly historiqueMigrationQuery: HistoriqueMigrationQuery,
  ) {}

  // Cette methode analyse une migration.
  public async analyser(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = MigrationBulletinValidator.validerAnalyse(corps, headers);
    const sortie = await this.genererMigrationBulletinUseCase.executer(entree);
    return MigrationPresenter.presenter(sortie as never);
  }

  // Cette methode applique une migration deja preparee.
  public async appliquer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = MigrationBulletinValidator.validerApplication(corps, headers);
    const sortie = await this.appliquerMigrationBulletinUseCase.executer(entree);
    return MigrationPresenter.presenter(sortie as never);
  }

  // Cette methode lit l'historique des migrations d'une classe.
  public async lister(query: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const sorties = await this.historiqueMigrationQuery.executer(
      ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
    );
    const lignes = sorties.map((sortie) => MigrationPresenter.presenter(sortie as never).donnee);
    const total = lignes.length;
    return PaginationPresenter.presenter(lignes, 1, total || 20, total);
  }
}
