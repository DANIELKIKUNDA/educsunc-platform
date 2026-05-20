import type { UseCase } from 'shared/application/UseCase';
import type { AjouterRestrictionRoleInput } from '../../dto/input';
import type { RoleRestrictionsOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class AjouterRestrictionRoleUseCase implements UseCase<AjouterRestrictionRoleInput, RoleRestrictionsOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: AjouterRestrictionRoleInput): Promise<RoleRestrictionsOutput> {
    return this.securityRoleService.ajouterRestriction(entree);
  }
}
