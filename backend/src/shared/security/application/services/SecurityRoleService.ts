import type { Role } from '../../../security/domain';
import { Role as RoleAgregat } from '../../../security/domain';
import { PermissionMapper, RoleMapper } from '../mappers';
import type { AjouterPermissionRoleInput, AjouterRestrictionRoleInput, CreerRoleInput, RetirerPermissionRoleInput, RetirerRestrictionRoleInput } from '../dto/input';
import type { RoleOutput, RolePermissionsOutput, RoleRestrictionsOutput } from '../dto/output';
import type { ClockPort, PermissionRepositoryPort, RoleRepositoryPort } from '../ports';
import { ErreurActivationRole, ErreurAjoutPermission, ErreurCreationRole, ErreurModificationRole, ErreurRetraitPermission } from '../exceptions';

// Ce service gere les roles, permissions et restrictions au niveau applicatif.
export class SecurityRoleService {
  constructor(
    private readonly roleRepositoryPort: RoleRepositoryPort,
    private readonly permissionRepositoryPort: PermissionRepositoryPort,
    private readonly clockPort: ClockPort,
  ) {}

  public async creerRole(input: CreerRoleInput): Promise<RoleOutput> {
    try {
      void this.clockPort.maintenant();
      const role = RoleAgregat.creer(input);
      await this.roleRepositoryPort.sauvegarder(role);
      return RoleMapper.depuisDomaine(role);
    } catch (error) {
      throw new ErreurCreationRole(error instanceof Error ? error.message : undefined);
    }
  }

  public async activerRole(codeRole: string): Promise<RoleOutput> {
    const role = await this.obtenirRoleExistant(codeRole);
    try {
      role.activer();
      await this.roleRepositoryPort.sauvegarder(role);
      return RoleMapper.depuisDomaine(role);
    } catch (error) {
      throw new ErreurActivationRole(error instanceof Error ? error.message : undefined);
    }
  }

  public async desactiverRole(codeRole: string): Promise<RoleOutput> {
    const role = await this.obtenirRoleExistant(codeRole);
    try {
      role.desactiver();
      await this.roleRepositoryPort.sauvegarder(role);
      return RoleMapper.depuisDomaine(role);
    } catch (error) {
      throw new ErreurActivationRole(error instanceof Error ? error.message : undefined);
    }
  }

  public async ajouterPermission(input: AjouterPermissionRoleInput): Promise<RolePermissionsOutput> {
    const role = await this.obtenirRoleExistant(input.codeRole);
    try {
      role.ajouterPermission(input.permission, input.creePar);
      await this.roleRepositoryPort.sauvegarder(role);
      return PermissionMapper.depuisRole(role);
    } catch (error) {
      throw new ErreurAjoutPermission(error instanceof Error ? error.message : undefined);
    }
  }

  public async retirerPermission(input: RetirerPermissionRoleInput): Promise<RolePermissionsOutput> {
    const role = await this.obtenirRoleExistant(input.codeRole);
    try {
      role.retirerPermission(input.permission);
      await this.roleRepositoryPort.sauvegarder(role);
      return PermissionMapper.depuisRole(role);
    } catch (error) {
      throw new ErreurRetraitPermission(error instanceof Error ? error.message : undefined);
    }
  }

  public async ajouterRestriction(input: AjouterRestrictionRoleInput): Promise<RoleRestrictionsOutput> {
    const role = await this.obtenirRoleExistant(input.codeRole);
    try {
      role.ajouterRestriction(input.codeRestriction, input.description);
      await this.roleRepositoryPort.sauvegarder(role);
      return {
        codeRole: role.obtenirCodeRole().obtenirValeur(),
        restrictions: role.obtenirRestrictions().map((restriction) => restriction.obtenirCodeRestriction().obtenirValeur()),
      };
    } catch (error) {
      throw new ErreurModificationRole(error instanceof Error ? error.message : undefined);
    }
  }

  public async retirerRestriction(input: RetirerRestrictionRoleInput): Promise<RoleRestrictionsOutput> {
    const role = await this.obtenirRoleExistant(input.codeRole);
    try {
      role.retirerRestriction(input.codeRestriction);
      await this.roleRepositoryPort.sauvegarder(role);
      return {
        codeRole: role.obtenirCodeRole().obtenirValeur(),
        restrictions: role.obtenirRestrictions().map((restriction) => restriction.obtenirCodeRestriction().obtenirValeur()),
      };
    } catch (error) {
      throw new ErreurModificationRole(error instanceof Error ? error.message : undefined);
    }
  }

  public async listerPermissionsRole(codeRole: string): Promise<readonly string[]> {
    return this.permissionRepositoryPort.listerPermissionsRole(codeRole);
  }

  private async obtenirRoleExistant(codeRole: string): Promise<Role> {
    const role = await this.roleRepositoryPort.trouverParCode(codeRole);
    if (!role) {
      throw new ErreurModificationRole('Role introuvable');
    }
    return role;
  }
}
