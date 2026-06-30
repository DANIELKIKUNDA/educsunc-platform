export interface SecurityApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface SecurityRoleItem {
  idRole: string;
  codeRole: string;
  nomRole: string;
  description?: string;
  niveauAcces: string;
  estActif: boolean;
}

export interface SecurityRolePermissionsItem {
  codeRole: string;
  permissions: string[];
}

export interface SecurityRoleRestrictionsItem {
  codeRole: string;
  restrictions: string[];
}

export interface SecurityAffectationItem {
  idAffectationUtilisateur: string;
  idUtilisateur: string;
  idRole: string;
  niveauAcces: string;
  etatAffectation: string;
  idOrganisation?: string;
  idEcole?: string;
}

export interface SecurityScopeItem {
  typeScope: string;
  valeurScope: string;
  estLectureSeule: boolean;
}

export interface SecurityTitulariatItem {
  idAffectationTitulariat: string;
  idUtilisateur: string;
  idOrganisation: string;
  idEcole: string;
  idClasse: string;
  idAnneeScolaire: string;
  estActif: boolean;
}

export interface SecurityCheckPayload {
  idUtilisateur: string;
  permission?: string;
  typeScope?: string;
  valeurScope?: string;
  restriction?: string;
  idOrganisation?: string;
  idEcole?: string;
  action?: string;
  ressource?: string;
}

export interface SecurityRoleCreatePayload {
  codeRole: string;
  nomRole: string;
  description?: string;
  niveauAcces: string;
}

export interface SecurityRolePermissionPayload {
  permission: string;
}

export interface SecurityRoleRestrictionPayload {
  codeRestriction: string;
}

export interface SecurityAffectationCreatePayload {
  idUtilisateur: string;
  idRole: string;
  niveauAcces: string;
  idOrganisation?: string;
  idEcole?: string;
}

export interface SecurityScopeCreatePayload {
  typeScope: string;
  valeurScope: string;
  estLectureSeule?: boolean;
}

export interface SecurityTitulariatCreatePayload {
  idUtilisateur: string;
  idOrganisation: string;
  idEcole: string;
  idClasse: string;
  idAnneeScolaire: string;
}

export const securityActors = ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'] as const;
