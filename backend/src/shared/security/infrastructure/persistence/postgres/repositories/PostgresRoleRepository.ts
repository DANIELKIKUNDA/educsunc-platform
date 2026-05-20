import type { RoleRepositoryPort } from '../../../../application';
import type { Role } from '../../../../domain';
import { RolePersistenceMapper } from '../mappers';
import { obtenirMemoireSecurityStore } from './_memoireSecurityStore';

// Ce depot persiste les roles SECURITY dans un stockage technique sobre.
export class PostgresRoleRepository implements RoleRepositoryPort {
  public async sauvegarder(role: Role): Promise<void> {
    const store = obtenirMemoireSecurityStore();
    const record = RolePersistenceMapper.versRecord(role);
    store.roles.set(record.id_role, record);
    store.rolesParCode.set(record.code_role, record.id_role);
  }

  public async trouverParCode(codeRole: string): Promise<Role | null> {
    const store = obtenirMemoireSecurityStore();
    const idRole = store.rolesParCode.get(codeRole);
    if (!idRole) {
      return null;
    }
    const record = store.roles.get(idRole);
    return record ? RolePersistenceMapper.depuisRecord(record) : null;
  }

  public async trouverParId(idRole: string): Promise<Role | null> {
    const record = obtenirMemoireSecurityStore().roles.get(idRole);
    return record ? RolePersistenceMapper.depuisRecord(record) : null;
  }
}
