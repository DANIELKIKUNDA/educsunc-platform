import type { DiagnosticEchecQuery } from 'contexts/bulletins-evaluations/application/queries/DiagnosticEchecQuery';
import type { NonClassesQuery } from 'contexts/bulletins-evaluations/application/queries/NonClassesQuery';
import type { ConsulterBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterBulletinEleve/ConsulterBulletinEleveUseCase';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { ResultatBulletinPresenter } from '../presenters/ResultatBulletinPresenter';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les lectures HTTP liees aux resultats, diagnostics et non classes.
export class ResultatsBulletinController {
  // Ce constructeur injecte la lecture du resultat courant et les queries de liste specialisees.
  constructor(
    private readonly consulterBulletinEleveUseCase: ConsulterBulletinEleveUseCase,
    private readonly diagnosticEchecQuery: DiagnosticEchecQuery,
    private readonly nonClassesQuery: NonClassesQuery,
  ) {}

  // Cette methode consulte le resultat principal d'un eleve a partir des identifiants de route.
  public async consulterResultat(params: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const sortie = await this.consulterBulletinEleveUseCase.executer({
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idEleve'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
    });
    return ResultatBulletinPresenter.presenter(sortie as never);
  }

  // Cette methode lit les eleves non classes d'une classe.
  public async consulterNonClasses(query: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const filtres = QueryFilterValidator.valider(query);
    const donnees = await this.nonClassesQuery.executer(
      ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idClassePedagogique',
      ),
      ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idAnneeScolaire',
      ),
      ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'codeColonne',
      ),
    );
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les diagnostics d'echec d'une classe.
  public async consulterDiagnostics(query: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const filtres = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const donnees = await this.diagnosticEchecQuery.executer(
      ValidationHttpBulletinsEvaluations.lireChaineRequise(filtres, 'idEleve'),
      ValidationHttpBulletinsEvaluations.lireChaineRequise(filtres, 'idAnneeScolaire'),
    );
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }
}
