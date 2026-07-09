export type FrontendGovernanceLevel = 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';

export type FrontendActorCode =
  | 'MANAGER_SYSTEME'
  | 'OPERATEUR_SYSTEME'
  | 'SUPPORT_SYSTEME'
  | 'PROMOTEUR_ORGANISATION'
  | 'ADMIN_SYSTEME_ORGANISATION'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'ADMIN_SYSTEME_ECOLE'
  | 'ADMINISTRATEUR_ECOLE'
  | 'CAISSIER'
  | 'SECRETAIRE'
  | 'ENSEIGNANT'
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_DISCIPLINE'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE'
  | 'PARENT'
  | 'COMPTABLE';

export type FrontendModuleCode =
  | 'PLATEFORME'
  | 'ORGANISATION'
  | 'ADMINISTRATION_ECOLE'
  | 'ACADEMIQUE'
  | 'PEDAGOGIQUE'
  | 'SCOLARITE'
  | 'FINANCES'
  | 'MONITORING'
  | 'AUDIT'
  | 'CONFIGURATION'
  | 'NOTIFICATIONS'
  | 'SECURITY';

export interface FrontendActorProfile {
  code: FrontendActorCode;
  label: string;
  displayName: string;
  homeRoute: string;
  governanceLevels: readonly FrontendGovernanceLevel[];
}

export interface FrontendModuleDoctrine {
  code: FrontendModuleCode;
  label: string;
  description: string;
  icon: string;
  route: string;
  ownerLevels: readonly FrontendGovernanceLevel[];
}

export interface FrontendPageAction {
  code: string;
  label: string;
  actorCodes?: readonly FrontendActorCode[];
}

export interface FrontendPageDoctrine {
  code: string;
  routeName: string;
  routePath: string;
  label: string;
  moduleCode: FrontendModuleCode;
  sectionCode: string;
  sectionLabel: string;
  pageType: 'home' | 'liste' | 'detail' | 'action' | 'analyse' | 'parametrage' | 'centre';
  icon: string;
  actorCodes: readonly FrontendActorCode[];
  governanceLevels: readonly FrontendGovernanceLevel[];
  visibleActions: readonly FrontendPageAction[];
  hiddenInNavigation?: boolean;
}
