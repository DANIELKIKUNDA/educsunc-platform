import type { ConsulterProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterProclamationClasse/ConsulterProclamationClasseUseCase';
import type { GenererProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererProclamationClasse/GenererProclamationClasseUseCase';
import { ProclamationPresenter } from '../presenters/ProclamationPresenter';
import { GenererProclamationValidator } from '../validators/GenererProclamationValidator';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP lies aux proclamations.
export class ProclamationsController {
  // Ce constructeur injecte les cas d'usage dedies a la generation et a la lecture des proclamations.
  constructor(
    private readonly genererProclamationClasseUseCase: GenererProclamationClasseUseCase,
    private readonly consulterProclamationClasseUseCase: ConsulterProclamationClasseUseCase,
  ) {}

  // Cette methode genere une proclamation de classe.
  public async generer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = GenererProclamationValidator.valider(corps, headers);
    const sortie = await this.genererProclamationClasseUseCase.executer(entree);
    return ProclamationPresenter.presenter(sortie as never);
  }

  // Cette methode consulte une proclamation de classe.
  public async consulter(query: unknown): Promise<{ donnee: unknown }> {
    const filtres = QueryFilterValidator.valider(query);
    const sortie = await this.consulterProclamationClasseUseCase.executer({
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
    return ProclamationPresenter.presenter(sortie as never);
  }

  // Cette methode prepare l'export PDF d'une proclamation a partir de la consultation.
  public async telechargerPdf(query: unknown): Promise<{ donnee: unknown }> {
    return this.consulter(query);
  }
}
