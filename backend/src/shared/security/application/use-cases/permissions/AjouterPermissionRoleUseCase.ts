import type { UseCase } from 'shared/application/UseCase';
import type { AjouterPermissionRoleInput } from '../../dto/input';
import type { RolePermissionsOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class AjouterPermissionRoleUseCase implements UseCase<AjouterPermissionRoleInput, RolePermissionsOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: AjouterPermissionRoleInput): Promise<RolePermissionsOutput> {
    return this.securityRoleService.ajouterPermission(entree);
  }
}
