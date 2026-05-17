import type { SynchroniserOperationsOfflineUseCase } from 'contexts/bulletins-evaluations/application/use-cases/SynchroniserOperationsOffline/SynchroniserOperationsOfflineUseCase';
import { SynchronisationPresenter } from '../presenters/SynchronisationPresenter';
import { SynchronisationOfflineValidator } from '../validators/SynchronisationOfflineValidator';

// Ce controleur expose les endpoints HTTP de synchronisation offline.
export class SynchronisationOfflineController {
  // Ce constructeur injecte le cas d'usage de synchronisation offline.
  constructor(private readonly synchroniserOperationsOfflineUseCase: SynchroniserOperationsOfflineUseCase) {}

  // Cette methode rejoue une operation offline.
  public async replay(corps: unknown): Promise<{ donnee: unknown }> {
    const entree = SynchronisationOfflineValidator.valider(corps);
    const sortie = await this.synchroniserOperationsOfflineUseCase.executer(entree);
    return SynchronisationPresenter.presenter(sortie as never);
  }

  // Cette methode expose un point d'entree de resolution de conflits.
  public async resoudreConflit(corps: unknown): Promise<{ donnee: unknown }> {
    return this.replay(corps);
  }

  // Cette methode retourne un statut technique simple de synchronisation.
  public async consulterStatut(): Promise<{ donnee: { statut: string } }> {
    return { donnee: { statut: 'ACTIF' } };
  }
}
