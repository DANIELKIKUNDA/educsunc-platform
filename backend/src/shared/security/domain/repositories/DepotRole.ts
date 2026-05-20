import { Role } from '../aggregates/Role';

export interface DepotRole {
  sauvegarder(role: Role): Promise<void>;
  trouverParCode(codeRole: string): Promise<Role | null>;
  trouverParId(idRole: string): Promise<Role | null>;
}
