import type { ConsulterClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterClassementClasse/ConsulterClassementClasseUseCase';
import type { RecalculerClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase';
import { ClassementPresenter } from '../presenters/ClassementPresenter';
import { ConsulterClassementValidator } from '../validators/ConsulterClassementValidator';
import { RecalculClassementValidator } from '../validators/RecalculClassementValidator';

// Ce controleur expose les routes HTTP de consultation et recalcul des classements.
export class ClassementsController {
  // Ce constructeur injecte uniquement les cas d'usage lies au classement.
  constructor(
    private readonly consulterClassementClasseUseCase: ConsulterClassementClasseUseCase,
    private readonly recalculerClassementClasseUseCase: RecalculerClassementClasseUseCase,
  ) {}

  // Cette methode consulte le classement d'une classe.
  public async consulter(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ConsulterClassementValidator.valider(query, headers);
    const sortie = await this.consulterClassementClasseUseCase.executer(entree);
    return ClassementPresenter.presenter(sortie as never);
  }

  // Cette methode relance le recalcul d'un classement.
  public async recalculer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = RecalculClassementValidator.valider(corps, headers);
    const sortie = await this.recalculerClassementClasseUseCase.executer(entree);
    return { donnee: sortie };
  }
}
