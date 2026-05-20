import type { Role } from '../../../domain';
export interface RoleRepositoryPort {
  sauvegarder(role: Role): Promise<void>;
  trouverParCode(codeRole: string): Promise<Role | null>;
  trouverParId(idRole: string): Promise<Role | null>;
}
