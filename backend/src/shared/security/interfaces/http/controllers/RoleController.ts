import type {
  ActiverRoleUseCase,
  AjouterPermissionRoleUseCase,
  AjouterRestrictionRoleUseCase,
  CreerRoleUseCase,
  DesactiverRoleUseCase,
  ListerPermissionsRoleUseCase,
  ListerRolesUseCase,
  RetirerPermissionRoleUseCase,
  RetirerRestrictionRoleUseCase,
} from 'shared/security/application';
import { AjouterPermissionRoleValidator, AjouterRestrictionRoleValidator, CreerRoleValidator } from '../validators';
import { RolePresenter } from '../presenters/RolePresenter';

// Ce controleur orchestre les endpoints HTTP de gestion des roles SECURITY.
export class RoleController {
  constructor(
    private readonly creerRoleUseCase: CreerRoleUseCase,
    private readonly activerRoleUseCase: ActiverRoleUseCase,
    private readonly desactiverRoleUseCase: DesactiverRoleUseCase,
    private readonly ajouterPermissionRoleUseCase: AjouterPermissionRoleUseCase,
    private readonly retirerPermissionRoleUseCase: RetirerPermissionRoleUseCase,
    private readonly ajouterRestrictionRoleUseCase: AjouterRestrictionRoleUseCase,
    private readonly retirerRestrictionRoleUseCase: RetirerRestrictionRoleUseCase,
    private readonly listerRolesUseCase: ListerRolesUseCase,
    private readonly listerPermissionsRoleUseCase: ListerPermissionsRoleUseCase,
  ) {}

  public async creer(corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.creerRoleUseCase.executer(CreerRoleValidator.valider(corps));
    return RolePresenter.presenter(sortie);
  }

  public async activer(codeRole: string): Promise<{ donnee: unknown }> {
    const sortie = await this.activerRoleUseCase.executer({ codeRole });
    return RolePresenter.presenter(sortie);
  }

  public async desactiver(codeRole: string): Promise<{ donnee: unknown }> {
    const sortie = await this.desactiverRoleUseCase.executer({ codeRole });
    return RolePresenter.presenter(sortie);
  }

  public async ajouterPermission(codeRole: string, corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.ajouterPermissionRoleUseCase.executer(AjouterPermissionRoleValidator.valider(corps, codeRole));
    return { donnee: { success: true, data: sortie } };
  }

  public async retirerPermission(codeRole: string, permission: string): Promise<{ donnee: unknown }> {
    const sortie = await this.retirerPermissionRoleUseCase.executer({ codeRole, permission });
    return { donnee: { success: true, data: sortie } };
  }

  public async ajouterRestriction(codeRole: string, corps: unknown): Promise<{ donnee: unknown }> {
    const sortie = await this.ajouterRestrictionRoleUseCase.executer(AjouterRestrictionRoleValidator.valider(corps, codeRole));
    return { donnee: { success: true, data: sortie } };
  }

  public async retirerRestriction(codeRole: string, codeRestriction: string): Promise<{ donnee: unknown }> {
    const sortie = await this.retirerRestrictionRoleUseCase.executer({ codeRole, codeRestriction });
    return { donnee: { success: true, data: sortie } };
  }

  public async listerRoles(): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerRolesUseCase.executer() } };
  }

  public async listerPermissions(codeRole: string): Promise<{ donnee: unknown }> {
    return { donnee: { success: true, data: await this.listerPermissionsRoleUseCase.executer({ codeRole }) } };
  }
}
