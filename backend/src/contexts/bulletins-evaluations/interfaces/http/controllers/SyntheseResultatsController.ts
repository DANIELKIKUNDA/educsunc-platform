import type { ConsulterSyntheseResultatsUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterSyntheseResultats/ConsulterSyntheseResultatsUseCase';
import type { GenererSyntheseResultatsEcoleUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererSyntheseResultatsEcole/GenererSyntheseResultatsEcoleUseCase';
import type { InitialiserSyntheseResultatsEcoleUseCase } from 'contexts/bulletins-evaluations/application/use-cases/InitialiserSyntheseResultatsEcole/InitialiserSyntheseResultatsEcoleUseCase';
import type { SynthesePdfPort } from 'contexts/bulletins-evaluations/application/ports/out/SynthesePdfPort';
import { SynthesePresenter } from '../presenters/SynthesePresenter';
import { GenererSyntheseValidator } from '../validators/GenererSyntheseValidator';
import { InitialiserSyntheseValidator } from '../validators/InitialiserSyntheseValidator';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP de synthese des resultats.
export class SyntheseResultatsController {
  // Ce constructeur injecte les cas d'usage lies a la synthese d'ecole.
  constructor(
    private readonly initialiserSyntheseResultatsEcoleUseCase: InitialiserSyntheseResultatsEcoleUseCase,
    private readonly genererSyntheseResultatsEcoleUseCase: GenererSyntheseResultatsEcoleUseCase,
    private readonly consulterSyntheseResultatsUseCase: ConsulterSyntheseResultatsUseCase,
    private readonly synthesePdfPort?: SynthesePdfPort,
  ) {}

  // Cette methode initialise une synthese brouillon avant generation officielle.
  public async initialiser(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = InitialiserSyntheseValidator.valider(corps, headers);
    const sortie = await this.initialiserSyntheseResultatsEcoleUseCase.executer(entree);
    return SynthesePresenter.presenter(sortie as never);
  }

  // Cette methode genere une synthese d'ecole.
  public async generer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = GenererSyntheseValidator.valider(corps, headers);
    const sortie = await this.genererSyntheseResultatsEcoleUseCase.executer(entree);
    return SynthesePresenter.presenter(sortie as never);
  }

  // Cette methode consulte une synthese d'ecole.
  public async consulter(query: unknown): Promise<{ donnee: unknown }> {
    const filtres = QueryFilterValidator.valider(query);
    const sortie = await this.consulterSyntheseResultatsUseCase.executer({
      idEcole: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idEcole',
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
    return SynthesePresenter.presenter(sortie as never);
  }

  // Cette methode prepare un PDF de synthese a partir de la lecture existante.
  public async telechargerPdf(query: unknown): Promise<{ donnee: unknown }> {
    const synthese = await this.consulter(query);

    if (this.synthesePdfPort === undefined) {
      return synthese;
    }

    const pdf = await this.synthesePdfPort.genererSynthesePdf(synthese.donnee as never);
    return SynthesePresenter.presenter(pdf as never);
  }
}
