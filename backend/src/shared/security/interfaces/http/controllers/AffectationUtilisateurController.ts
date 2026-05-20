import type {
  ActiverAffectationUseCase,
  AjouterScopeAffectationUseCase,
  CreerAffectationUtilisateurUseCase,
  DesactiverAffectationUseCase,
  ListerAffectationsUtilisateurUseCase,
  ListerScopesUtilisateurUseCase,
  RetirerScopeAffectationUseCase,
} from 'shared/security/application';
import { AjouterScopeAffectationValidator, CreerAffectationUtilisateurValidator } from '../validators';
import { AffectationPresenter } from '../presenters/AffectationPresenter';

// Ce controleur orchestre les endpoints HTTP de gestion des affectations SECURITY.
export class AffectationUtilisateurController {
  constructor(
    private readonly creerAffectationUtilisateurUseCase: CreerAffectationUtilisateurUseCase,
    private readonly activerAffectationUseCase: ActiverAffectationUseCase,
    private readonly desactiverAffectationUseCase: DesactiverAffectationUseCase,
    private readonly ajouterScopeAffectationUseCase: AjouterScopeAffectationUseCase,
    private readonly retirerScopeAffectationUseCase: RetirerScopeAffectationUseCase,
    private readonly listerAffectationsUtilisateurUseCase: ListerAffectationsUtilisateurUseCase,
    private readonly listerScopesUtilisateurUseCase: ListerScopesUtilisateurUseCase,
  ) {}

  public async creer(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.creerAffectationUtilisateurUseCase.executer(CreerAffectationUtilisateurValidator.valider(corps));
    return AffectationPresenter.presenterAffectation(sortie);
  }

  public async activer(idAffectationUtilisateur: string): Promise<{ donnee: unknown }> {
    const sortie = await this.activerAffectationUseCase.executer({ idAffectationUtilisateur });
    return AffectationPresenter.presenterAffectation(sortie);
  }

  public async desactiver(idAffectationUtilisateur: string): Promise<{ donnee: unknown }> {
    const sortie = await this.desactiverAffectationUseCase.executer({ idAffectationUtilisateur });
    return AffectationPresenter.presenterAffectation(sortie);
  }

  public async ajouterScope(idAffectationUtilisateur: string, corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.ajouterScopeAffectationUseCase.executer(AjouterScopeAffectationValidator.valider(corps, idAffectationUtilisateur));
    return AffectationPresenter.presenterScopes(sortie);
  }

  public async retirerScope(idAffectationUtilisateur: string, typeScope: string, valeurScope: string): Promise<{ donnee: unknown }> {
    const sortie = await this.retirerScopeAffectationUseCase.executer({ idAffectationUtilisateur, typeScope, valeurScope });
    return AffectationPresenter.presenterScopes(sortie);
  }

  public async listerAffectations(idUtilisateur: string): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerAffectationsUtilisateurUseCase.executer({ idUtilisateur }) } };
  }

  public async listerScopes(idUtilisateur: string): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerScopesUtilisateurUseCase.executer({ idUtilisateur }) } };
  }
}
