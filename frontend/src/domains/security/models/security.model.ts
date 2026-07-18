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
  estSysteme: boolean;
  nombrePermissions: number;
  nombreRestrictions: number;
  nombreAffectations: number;
}

export interface SecurityRoleDetail extends SecurityRoleItem {
  permissions: readonly string[];
  restrictions: readonly string[];
  version: number;
  modifieLe?: string;
}

export interface SecurityPermissionCatalogItem {
  code: string;
  domaine: string;
  nombreRoles: number;
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
  permissions: string[];
  motif?: string;
}

export interface SecurityRolePermissionPayload {
  permission: string;
}

export interface SecurityRoleRestrictionPayload {
  codeRestriction: string;
}

export interface SecurityAffectationCreatePayload {
  idUtilisateur: string;
  idRole?: string;
  codeRole?: string;
  niveauAcces?: string;
  niveau?: SecurityGovernanceLevel;
  idOrganisation?: string;
  organisationId?: string;
  idEcole?: string;
  ecoleId?: string;
  motif?: string;
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

export type SecurityAccountState = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type SecurityGovernanceLevel = 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';

export interface SecurityOverview {
  comptesPlateformeActifs: number;
  comptesSuspendus: number;
  comptesVerrouilles: number;
  sessionsActives: number;
  tentativesEchoueesRecentes: number;
  organisationsSansAdministrateur: number;
  ecolesSansAdministrateur: number;
}

export interface SecurityAccountAssignment {
  idAffectation: string;
  role: string;
  roleLibelle: string;
  niveau: SecurityGovernanceLevel;
  organisationId?: string;
  ecoleId?: string;
  etat: string;
}

export interface SecurityAccount {
  id: string;
  nomComplet: string;
  email: string;
  telephone?: string;
  etat: SecurityAccountState;
  dernierAcces?: string;
  verrouilleJusqua?: string;
  creeLe?: string;
  affectations: readonly SecurityAccountAssignment[];
  sessionsActives: number;
}

export interface SecurityAdministrator {
  idAffectation: string;
  idUtilisateur: string;
  nomComplet: string;
  email: string;
  telephone?: string;
  etatCompte: SecurityAccountState;
  etatAffectation: string;
  organisationId?: string;
  ecoleId?: string;
  dernierAcces?: string;
  verrouilleJusqua?: string;
  sessionsActives: number;
  organisationNom?: string;
  ecoleNom?: string;
}

export interface SecurityAdministrationScope {
  organisationId: string;
  organisationNom: string;
  ecoleId?: string;
  ecoleNom?: string;
  administrateursOrganisationActifs: number;
  administrateursEcoleActifs: number;
}

export interface SecurityAdministratorPayload {
  idUtilisateur?: string;
  nomComplet?: string;
  email?: string;
  telephone?: string;
  motDePasseInitial?: string;
  motif: string;
}

export interface SecurityAssignment {
  idAffectation: string;
  idUtilisateur: string;
  nomComplet: string;
  email: string;
  role: string;
  roleLibelle: string;
  niveau: SecurityGovernanceLevel;
  organisationId?: string;
  ecoleId?: string;
  etat: string;
  scopes: readonly { type: string; valeur: string; lectureSeule: boolean }[];
}

export interface SecuritySession {
  id: string;
  idUtilisateur: string;
  nomComplet: string;
  email: string;
  appareil?: string;
  navigateur?: string;
  adresseIp?: string;
  organisationId?: string;
  ecoleId?: string;
  creeLe?: string;
  dernierAcces?: string;
  statut: string;
  raisonRevocation?: string;
}

export interface SecurityLoginAttempt {
  id: string;
  email: string;
  nomComplet?: string;
  adresseIp?: string;
  navigateur?: string;
  reussie: boolean;
  resultat: string;
  date: string;
  etatCompte?: SecurityAccountState;
  verrouilleJusqua?: string;
  nombreTentatives: number;
}

export interface SecurityCursorPage<T> {
  elements: readonly T[];
  curseurSuivant?: string;
}

export interface SecurityCreateAccountPayload {
  nomComplet: string;
  email: string;
  telephone?: string;
  motDePasseInitial: string;
  codeRole: string;
  motif?: string;
}
