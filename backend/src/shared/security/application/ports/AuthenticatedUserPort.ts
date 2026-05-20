import type { EtatCompteUtilisateur } from 'shared/auth/domain';
export interface AuthenticatedUserPort {
  idUtilisateur: string;
  email: string;
  etatCompte: EtatCompteUtilisateur;
  roles: string[];
  permissions: string[];
  organisationActiveId?: string;
  ecoleActiveId?: string;
}
