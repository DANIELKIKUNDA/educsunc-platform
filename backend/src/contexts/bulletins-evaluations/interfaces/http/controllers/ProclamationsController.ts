import type { ConsulterProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterProclamationClasse/ConsulterProclamationClasseUseCase';
import type { GenererProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererProclamationClasse/GenererProclamationClasseUseCase';
import type { InitialiserProclamationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/InitialiserProclamationClasse/InitialiserProclamationClasseUseCase';
import type { ProclamationPdfPort } from 'contexts/bulletins-evaluations/application/ports/out/ProclamationPdfPort';
import { InitialiserProclamationValidator } from '../validators/InitialiserProclamationValidator';
import { ProclamationPresenter } from '../presenters/ProclamationPresenter';
import { GenererProclamationValidator } from '../validators/GenererProclamationValidator';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP lies aux proclamations.
export class ProclamationsController {
  // Ce constructeur injecte les cas d'usage dedies a la generation et a la lecture des proclamations.
  constructor(
    private readonly initialiserProclamationClasseUseCase: InitialiserProclamationClasseUseCase,
    private readonly genererProclamationClasseUseCase: GenererProclamationClasseUseCase,
    private readonly consulterProclamationClasseUseCase: ConsulterProclamationClasseUseCase,
    private readonly proclamationPdfPort?: ProclamationPdfPort,
  ) {}

  // Cette methode initialise une proclamation brouillon avant sa generation officielle.
  public async initialiser(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = InitialiserProclamationValidator.valider(corps, headers);
    const sortie = await this.initialiserProclamationClasseUseCase.executer(entree);
    return ProclamationPresenter.presenter(sortie as never);
  }

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
    const proclamation = await this.consulter(query);

    if (this.proclamationPdfPort === undefined) {
      return proclamation;
    }

    const pdf = await this.proclamationPdfPort.genererProclamationPdf(proclamation.donnee as never);
    return ProclamationPresenter.presenter(pdf as never);
  }
}
