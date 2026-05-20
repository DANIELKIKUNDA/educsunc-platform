import type { UseCase } from 'shared/application/UseCase';
import type { RetirerRestrictionRoleInput } from '../../dto/input';
import type { RoleRestrictionsOutput } from '../../dto/output';
import { SecurityRoleService } from '../../services/SecurityRoleService';

export class RetirerRestrictionRoleUseCase implements UseCase<RetirerRestrictionRoleInput, RoleRestrictionsOutput> {
  constructor(private readonly securityRoleService: SecurityRoleService) {}
  public async executer(entree: RetirerRestrictionRoleInput): Promise<RoleRestrictionsOutput> {
    return this.securityRoleService.retirerRestriction(entree);
  }
}
