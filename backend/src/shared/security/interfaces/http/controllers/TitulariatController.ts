import type {
  AttribuerTitulariatUseCase,
  RetirerTitulariatUseCase,
  VerifierTitulariatUseCase,
} from 'shared/security/application';
import { AttribuerTitulariatValidator } from '../validators';
import { TitulariatPresenter } from '../presenters/TitulariatPresenter';

// Ce controleur orchestre les endpoints HTTP de titulariat SECURITY.
export class TitulariatController {
  constructor(
    private readonly attribuerTitulariatUseCase: AttribuerTitulariatUseCase,
    private readonly retirerTitulariatUseCase: RetirerTitulariatUseCase,
    private readonly verifierTitulariatUseCase: VerifierTitulariatUseCase,
  ) {}

  public async attribuer(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.attribuerTitulariatUseCase.executer(AttribuerTitulariatValidator.valider(corps));
    return TitulariatPresenter.presenter(sortie);
  }

  public async retirer(idClasse: string, idAnneeScolaire: string): Promise<{ donnee: unknown }> {
    const sortie = await this.retirerTitulariatUseCase.executer({ idClasse, idAnneeScolaire });
    return TitulariatPresenter.presenter(sortie);
  }

  public async verifier(idClasse: string, idAnneeScolaire: string): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.verifierTitulariatUseCase.executer({ idClasse, idAnneeScolaire }) } };
  }
}
