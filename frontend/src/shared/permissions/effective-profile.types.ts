import type { FrontendGovernanceLevel, FrontendModuleCode } from '../doctrine/doctrine.types';

export const COMMERCIAL_MODULE_CODES = [
  'REFERENTIEL_ACADEMIQUE',
  'SCOLARITE_ELEVES',
  'PAIEMENTS_FACTURATION',
  'BULLETINS_EVALUATIONS',
  'NOTIFICATIONS',
  'AUDIT',
  'MONITORING',
] as const;

export type CommercialModuleCode = (typeof COMMERCIAL_MODULE_CODES)[number];

export type EffectiveScopeType =
  | 'PLATEFORME'
  | 'ORGANISATION'
  | 'ECOLE'
  | 'SECTION'
  | 'CLASSE'
  | 'COURS';

export type DerivedCapabilityCode = 'TITULAIRE_EFFECTIF';

export interface EffectiveScope {
  readonly typeScope: EffectiveScopeType;
  readonly valeurScope: string;
  readonly estLectureSeule: boolean;
  readonly idOrganisation?: string;
  readonly idEcole?: string;
  readonly idSection?: string;
  readonly idClasse?: string;
  readonly idCours?: string;
}

export interface EffectiveTitulariat {
  readonly idAffectationTitulariat: string;
  readonly idUtilisateur: string;
  readonly idOrganisation: string;
  readonly idEcole: string;
  readonly idClasse: string;
  readonly idAnneeScolaire: string;
  readonly estActif: boolean;
}

export interface EffectiveDerivedTitulariat {
  readonly idOrganisation: string;
  readonly idEcole: string;
  readonly idClasse: string;
  readonly idAnneeScolaire: string;
  readonly idSectionScolaire: string;
  readonly source: 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
}

export interface EffectiveAccessContext {
  readonly governanceLevel: FrontendGovernanceLevel;
  readonly utilisateurId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly sectionId?: string;
  readonly classeId?: string;
  readonly coursId?: string;
  readonly eleveId?: string;
  readonly anneeScolaireId?: string;
}

export interface EffectiveIdentityState {
  readonly id: string;
  readonly actif: boolean;
  readonly statut?: string;
}

export interface EffectiveTitulariatState {
  readonly actifs: readonly EffectiveTitulariat[];
  readonly effectifs: readonly EffectiveDerivedTitulariat[];
  readonly estTitulaireEffectif: boolean;
  readonly source:
    | 'AUCUNE'
    | 'AFFECTATION_TITULARIAT'
    | 'RESPONSABILITE_CLASSE';
}

export interface EffectiveProfileV1 {
  readonly version: 1;
  readonly resolved: boolean;
  readonly source: 'PROFIL_EFFECTIF' | 'AUCUNE';
  readonly actorCodes: readonly string[];
  readonly roleActif?: string;
  readonly permissionsEffectives: readonly string[];
  readonly scopes: readonly EffectiveScope[];
  readonly restrictions: readonly string[];
  readonly modulesEffectifs: readonly CommercialModuleCode[];
  readonly compte: EffectiveIdentityState;
  readonly session: EffectiveIdentityState;
  readonly contexte: EffectiveAccessContext;
  readonly titulariats: EffectiveTitulariatState;
  readonly ownership: {
    readonly elevesAutorises: readonly string[];
  };
}

export interface EffectiveProfilePayloadV1 {
  readonly version?: 1 | '1' | 'v1';
  readonly acteurCode?: string;
  readonly actorCode?: string;
  readonly actorCodes?: readonly string[];
  readonly acteurCodeActif?: string;
  readonly roleActif?: string;
  readonly permissionsEffectives?: readonly string[];
  readonly permissions?: readonly string[];
  readonly scopes?: readonly Partial<EffectiveScope>[];
  readonly restrictions?: readonly string[];
  readonly modulesEffectifs?: readonly string[];
  readonly compte?: Partial<EffectiveIdentityState> & {
    readonly idUtilisateur?: string;
    readonly etat?: string;
  };
  readonly session?: Partial<EffectiveIdentityState> & {
    readonly idSession?: string;
    readonly etat?: string;
  };
  readonly contexte?: Partial<EffectiveAccessContext> & {
    readonly niveau?: FrontendGovernanceLevel;
    readonly niveauGouvernance?: FrontendGovernanceLevel;
    readonly idUtilisateur?: string;
    readonly idOrganisation?: string;
    readonly idEcole?: string;
    readonly idSection?: string;
    readonly idClasse?: string;
    readonly idCours?: string;
    readonly idAnneeScolaire?: string;
  };
  readonly titulariats?: Partial<EffectiveTitulariatState>;
  readonly titulariatsActifs?: readonly Partial<EffectiveTitulariat>[];
  readonly titulariatsEffectifs?: readonly Partial<EffectiveDerivedTitulariat>[];
  readonly estTitulaireEffectif?: boolean;
  readonly sourceTitulariatEffectif?: EffectiveTitulariatState['source'];
  readonly capacitesEffectives?: {
    readonly permissions?: readonly string[];
    readonly restrictions?: readonly string[];
    readonly titulariatsActifs?: readonly Partial<EffectiveTitulariat>[];
    readonly titulariatsEffectifs?: readonly Partial<EffectiveDerivedTitulariat>[];
    readonly estTitulaireEffectif?: boolean;
    readonly sourceTitulariatEffectif?: EffectiveTitulariatState['source'];
  };
  readonly ownership?: {
    readonly elevesAutorises?: readonly string[];
  };
}

export interface EffectiveAccessTarget extends Partial<EffectiveAccessContext> {
  readonly governanceLevel: FrontendGovernanceLevel;
}

export interface EffectiveAccessRequirement {
  readonly actorCodes?: readonly string[];
  readonly governanceLevels?: readonly FrontendGovernanceLevel[];
  readonly permissionsAnyOf?: readonly string[];
  readonly permissionsAllOf?: readonly string[];
  readonly commercialModule?: CommercialModuleCode;
  readonly moduleRequiredAt?: readonly FrontendGovernanceLevel[];
  readonly scope: 'NONE' | 'CURRENT' | 'SELF';
  readonly mutation?: boolean;
  readonly blockedByRestrictions?: readonly string[];
  readonly derivedCapabilitiesAnyOf?: readonly DerivedCapabilityCode[];
  readonly ownedStudent?: boolean;
}

export type EffectiveAccessDenialReason =
  | 'PROFILE_UNRESOLVED'
  | 'ACCOUNT_INACTIVE'
  | 'SESSION_INACTIVE'
  | 'ACTOR_DENIED'
  | 'LEVEL_DENIED'
  | 'PERMISSION_DENIED'
  | 'MODULE_INACTIVE'
  | 'SCOPE_DENIED'
  | 'READ_ONLY_SCOPE'
  | 'RESTRICTION_APPLIED'
  | 'DERIVED_CAPABILITY_MISSING'
  | 'OWNERSHIP_DENIED'
  | 'ACTION_UNMAPPED'
  | 'PAGE_UNMAPPED'
  | 'MODULE_UNMAPPED';

export interface EffectiveAccessDecision {
  readonly allowed: boolean;
  readonly reason?: EffectiveAccessDenialReason;
  readonly matchedScope?: EffectiveScope;
}

export interface UiModulePolicy {
  readonly moduleCode: FrontendModuleCode;
  readonly commercialModule?: CommercialModuleCode;
  readonly moduleRequiredAt: readonly FrontendGovernanceLevel[];
}
