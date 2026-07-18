export interface RoleReadModel {
  idRole: string;
  codeRole: string;
  nomRole: string;
  niveauAcces: string;
  estActif: boolean;
  estSysteme: boolean;
  description?: string;
  nombrePermissions: number;
  nombreRestrictions: number;
  nombreAffectations: number;
}
