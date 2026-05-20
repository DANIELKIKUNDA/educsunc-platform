import type {
  VerifierAccesUseCase,
  VerifierPermissionUseCase,
  VerifierRestrictionUseCase,
  VerifierScopeUseCase,
} from 'shared/security/application';
import { VerifierAccesValidator, VerifierPermissionValidator, VerifierRestrictionValidator, VerifierScopeValidator } from '../validators';
import { AutorisationPresenter } from '../presenters/AutorisationPresenter';

// Ce controleur orchestre les verifications HTTP de permission, scope et acces.
export class AutorisationController {
  constructor(
    private readonly verifierPermissionUseCase: VerifierPermissionUseCase,
    private readonly verifierScopeUseCase: VerifierScopeUseCase,
    private readonly verifierRestrictionUseCase: VerifierRestrictionUseCase,
    private readonly verifierAccesUseCase: VerifierAccesUseCase,
  ) {}

  public async verifierPermission(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.verifierPermissionUseCase.executer(VerifierPermissionValidator.valider(corps));
    return AutorisationPresenter.presenterPermission(sortie);
  }

  public async verifierScope(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.verifierScopeUseCase.executer(VerifierScopeValidator.valider(corps));
    return AutorisationPresenter.presenterScope(sortie);
  }

  public async verifierRestriction(corps: unknown): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.verifierRestrictionUseCase.executer(VerifierRestrictionValidator.valider(corps)) } };
  }

  public async verifierAcces(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.verifierAccesUseCase.executer(VerifierAccesValidator.valider(corps));
    return AutorisationPresenter.presenterDecision(sortie);
  }
}
