export type ConfigurationScopeLevel = 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';

export type ConfigurationValue =
  | string
  | number
  | boolean
  | null
  | readonly ConfigurationValue[]
  | { readonly [key: string]: ConfigurationValue };

export interface ConfigurationScope {
  readonly niveau: ConfigurationScopeLevel;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
}

export interface ConfigurationGovernance {
  readonly proprietaireNiveau: ConfigurationScopeLevel;
  readonly heritable: boolean;
  readonly overridable: boolean;
  readonly visiblePour: readonly ConfigurationScopeLevel[];
  readonly auditRequis: boolean;
  readonly restartRequis: boolean;
}

export interface ConfigurationItem {
  readonly identifiant: string;
  readonly key: string;
  readonly statut: string;
  readonly scope: ConfigurationScope;
  readonly valeur: ConfigurationValue;
  readonly overrides: readonly {
    readonly scope: ConfigurationScope;
    readonly value: ConfigurationValue;
    readonly actorId: string;
    readonly raison?: string;
    readonly overrideLe: string | Date;
  }[];
  readonly lock: {
    readonly niveauMinimalAutorise: ConfigurationScopeLevel;
    readonly actorId: string;
    readonly raison?: string;
    readonly verrouilleLe: string | Date;
  } | null;
  readonly totalVersions: number;
  readonly creeLe: string | Date;
  readonly gouvernance: ConfigurationGovernance;
}

export interface EffectiveConfigurationItem {
  readonly scope: ConfigurationScope;
  readonly valeurs: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
    readonly sourceNiveau: ConfigurationScopeLevel;
    readonly herite: boolean;
    readonly verrouille: boolean;
    readonly explanation: string;
  }[];
}

export interface ConfigurationSnapshotItem {
  readonly identifiantSnapshot: string;
  readonly creeLe: string | Date;
  readonly valeurs: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
    readonly sourceNiveau: ConfigurationScopeLevel;
    readonly herite: boolean;
    readonly verrouille: boolean;
    readonly explanation: string;
  }[];
}

export interface ConfigurationDiffItem {
  readonly snapshotSourceId: string;
  readonly snapshotCibleId: string;
  readonly ajouts: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
  }[];
  readonly suppressions: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
  }[];
  readonly modifications: readonly {
    readonly key: string;
    readonly avant: ConfigurationValue;
    readonly apres: ConfigurationValue;
  }[];
}

export interface ConfigurationValidationItem {
  readonly valide: boolean;
  readonly warnings: readonly string[];
}

export interface ConfigurationApiEnvelope<TData> {
  readonly succes: boolean;
  readonly code: number;
  readonly donnees: TData;
  readonly meta?: {
    readonly dureeMs?: number;
    readonly correlationId?: string;
    readonly requestId?: string;
  };
}

export interface ConfigurationModulesResolution {
  readonly organisationId: string;
  readonly ecoleId: string;
  readonly modulesAutorisesOrganisation: readonly ConfigurationModuleCode[];
  readonly modulesActivesEcole: readonly ConfigurationModuleCode[];
  readonly modulesEffectifs: readonly ConfigurationModuleCode[];
}

export type ConfigurationModuleCode =
  | 'REFERENTIEL_ACADEMIQUE'
  | 'SCOLARITE_ELEVES'
  | 'PAIEMENTS_FACTURATION'
  | 'BULLETINS_EVALUATIONS'
  | 'NOTIFICATIONS'
  | 'AUDIT'
  | 'MONITORING';

export const configurationModuleCatalog: ReadonlyArray<{
  code: ConfigurationModuleCode;
  label: string;
  description: string;
}> = [
  { code: 'REFERENTIEL_ACADEMIQUE', label: 'Referentiel academique', description: 'Socle academique, classes et programmes.' },
  { code: 'SCOLARITE_ELEVES', label: 'Scolarite eleves', description: 'Inscriptions, familles et cycle de vie eleve.' },
  { code: 'PAIEMENTS_FACTURATION', label: 'Paiements facturation', description: 'Caisse, paiements et recouvrements.' },
  { code: 'BULLETINS_EVALUATIONS', label: 'Bulletins evaluations', description: 'Resultats, bulletins et analyses.' },
  { code: 'NOTIFICATIONS', label: 'Notifications', description: 'Diffusions et canaux de communication.' },
  { code: 'AUDIT', label: 'Audit', description: 'Traches, controles et forensic.' },
  { code: 'MONITORING', label: 'Monitoring', description: 'Observation et sante de la plateforme.' },
];

export const configurationPlatformActors = ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'] as const;
export const configurationPlatformWriteActors = ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'] as const;
export const configurationOrganizationActors = ['PROMOTEUR_ORGANISATION', 'ADMIN_SYSTEME_ORGANISATION', 'GESTIONNAIRE_ORGANISATION'] as const;
export const configurationOrganizationWriteActors = ['PROMOTEUR_ORGANISATION', 'ADMIN_SYSTEME_ORGANISATION'] as const;
export const configurationSchoolActors = ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'] as const;

