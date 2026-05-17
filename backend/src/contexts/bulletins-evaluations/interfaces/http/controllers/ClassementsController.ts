import type { ConsulterClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterClassementClasse/ConsulterClassementClasseUseCase';
import type { RecalculerClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase';
import { ClassementPresenter } from '../presenters/ClassementPresenter';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { RecalculClassementValidator } from '../validators/RecalculClassementValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les routes HTTP de consultation et recalcul des classements.
export class ClassementsController {
  // Ce constructeur injecte uniquement les cas d'usage lies au classement.
  constructor(
    private readonly consulterClassementClasseUseCase: ConsulterClassementClasseUseCase,
    private readonly recalculerClassementClasseUseCase: RecalculerClassementClasseUseCase,
  ) {}

  // Cette methode consulte le classement d'une classe.
  public async consulter(query: unknown): Promise<{ donnee: unknown }> {
    const filtres = QueryFilterValidator.valider(query);
    const sortie = await this.consulterClassementClasseUseCase.executer({
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idClassePedagogique',
      ),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idAnneeScolaire',
      ),
      codeColonne: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'codeColonne',
      ) as never,
    });
    return ClassementPresenter.presenter(sortie as never);
  }

  // Cette methode relance le recalcul d'un classement.
  public async recalculer(corps: unknown): Promise<{ donnee: unknown }> {
    const entree = RecalculClassementValidator.valider(corps);
    const sortie = await this.recalculerClassementClasseUseCase.executer(entree);
    return { donnee: sortie };
  }
}
