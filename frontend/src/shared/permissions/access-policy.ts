import type { FrontendGovernanceLevel, FrontendModuleCode } from '../doctrine/doctrine.types';
import type {
  CommercialModuleCode,
  DerivedCapabilityCode,
  EffectiveAccessRequirement,
  UiModulePolicy,
} from './effective-profile.types';

export interface UiActionPolicy {
  readonly permissionsAnyOf?: readonly string[];
  readonly permissionsAllOf?: readonly string[];
  readonly scope: EffectiveAccessRequirement['scope'];
  readonly mutation?: boolean;
  readonly blockedByRestrictions?: readonly string[];
  readonly derivedForActorCodes?: readonly string[];
  readonly derivedCapabilitiesAnyOf?: readonly DerivedCapabilityCode[];
  readonly ownershipForActorCodes?: readonly string[];
}

function policy(
  actionCodes: readonly string[],
  requirement: UiActionPolicy,
): ReadonlyArray<readonly [string, UiActionPolicy]> {
  return actionCodes.map((actionCode) => [actionCode, requirement] as const);
}

const readReferentiel = {
  permissionsAnyOf: ['referentiel.read'],
  scope: 'CURRENT',
} as const satisfies UiActionPolicy;
const writeReferentiel = {
  permissionsAnyOf: ['referentiel.write'],
  scope: 'CURRENT',
  mutation: true,
} as const satisfies UiActionPolicy;
const readStudents = {
  permissionsAnyOf: ['eleves.read'],
  scope: 'CURRENT',
} as const satisfies UiActionPolicy;
const writeStudents = {
  permissionsAnyOf: ['eleves.write'],
  scope: 'CURRENT',
  mutation: true,
} as const satisfies UiActionPolicy;
const readPayments = {
  permissionsAnyOf: ['paiements.read'],
  scope: 'CURRENT',
  blockedByRestrictions: ['INTERDICTION_FINANCES'],
  ownershipForActorCodes: ['PARENT'],
} as const satisfies UiActionPolicy;
const writePayments = {
  permissionsAnyOf: ['paiements.write'],
  scope: 'CURRENT',
  mutation: true,
  blockedByRestrictions: ['INTERDICTION_FINANCES'],
} as const satisfies UiActionPolicy;
const readBulletins = {
  permissionsAnyOf: ['bulletins.read'],
  scope: 'CURRENT',
  blockedByRestrictions: ['INTERDICTION_BULLETINS'],
  ownershipForActorCodes: ['PARENT'],
} as const satisfies UiActionPolicy;
const readBulletinsTitulaireOuSupervision = {
  ...readBulletins,
  derivedForActorCodes: ['ENSEIGNANT'],
  derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
} as const satisfies UiActionPolicy;

const actionPolicyEntries: ReadonlyArray<readonly [string, UiActionPolicy]> = [
  ...policy(['platform.consulter', 'platform.referentiel.read', 'platform.referentiel.compare'], readReferentiel),
  ...policy([
    'platform.referentiel.activate',
    'platform.referentiel.import',
    'platform.referentiel.migrate',
    'platform.referentiel.publish',
  ], writeReferentiel),

  ...policy([
    'organization.consulter',
    'organization.detail.activate-context',
    'organization.detail.read',
    'organization.read',
    'organization.school.detail.read',
    'organization.schools.read',
  ], readReferentiel),
  ...policy(['organization.write'], writeReferentiel),
  ...policy([
    'organization.configuration.read',
    'configuration.organization.read',
  ], {
    permissionsAnyOf: ['configuration.read'],
    scope: 'CURRENT',
  }),
  ...policy([
    'organization.configuration.manage',
    'configuration.organization.manage',
  ], {
    permissionsAnyOf: ['configuration.update'],
    scope: 'CURRENT',
    mutation: true,
  }),

  ...policy(['referentiel.read'], readReferentiel),
  ...policy(['referentiel.write'], writeReferentiel),
  ...policy(['configuration.modules.school.write'], {
    permissionsAnyOf: ['configuration.modules.school.write'],
    scope: 'CURRENT',
    mutation: true,
  }),

  ...policy([
    'academique.consulter',
    'academique.referentiels.read',
    'academique.referentiels.compare',
  ], readReferentiel),
  ...policy([
    'academique.referentiels.activate',
    'academique.referentiels.import',
    'academique.referentiels.migrate',
    'academique.referentiels.publish',
  ], writeReferentiel),
  ...policy(['academique.local.school-years.manage'], {
    permissionsAnyOf: ['annees.write'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy([
    'academique.local.calendar.manage',
    'academique.local.classes.manage',
    'academique.local.programmes.manage',
    'academique.local.responsables.manage',
  ], writeReferentiel),

  ...policy(['pedagogique.consulter'], {
    permissionsAnyOf: ['cotes.read', 'bulletins.read', 'eleves.read'],
    scope: 'CURRENT',
  }),
  ...policy(['pedagogique.fiches.read'], {
    permissionsAnyOf: ['cotes.read'],
    scope: 'CURRENT',
  }),
  ...policy(['pedagogique.fiches.write'], {
    permissionsAnyOf: ['cotes.write'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_MODIFICATION_COTES'],
  }),
  ...policy([
    'pedagogique.analyses.read',
    'pedagogique.classements.read',
    'pedagogique.resultats.detail.read',
    'pedagogique.resultats.read',
    'pedagogique.statistiques.read',
  ], readBulletinsTitulaireOuSupervision),
  ...policy(['pedagogique.classements.recompute'], {
    permissionsAnyOf: ['bulletins.read'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_BULLETINS'],
    derivedForActorCodes: ['ENSEIGNANT'],
    derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
  }),
  ...policy(['pedagogique.conduite.read'], {
    ...readStudents,
    derivedForActorCodes: ['ENSEIGNANT'],
    derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
  }),
  ...policy(['pedagogique.conduite.write'], {
    permissionsAnyOf: ['cotes.write'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_MODIFICATION_COTES'],
    derivedForActorCodes: ['ENSEIGNANT'],
    derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
  }),
  ...policy(['pedagogique.bulletins.generate'], {
    permissionsAnyOf: ['bulletins.read'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_BULLETINS'],
    derivedForActorCodes: ['ENSEIGNANT'],
    derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
  }),
  ...policy(['pedagogique.proclamations.generate'], {
    permissionsAnyOf: ['bulletins.read'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_BULLETINS'],
    derivedForActorCodes: ['ENSEIGNANT'],
    derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
  }),

  ...policy(['scolarite.consulter', 'scolarite.cycle.read'], readStudents),
  ...policy([
    'scolarite.affectations.manage',
    'scolarite.cycle.deces',
    'scolarite.cycle.reactivation',
    'scolarite.cycle.reintegration',
    'scolarite.cycle.suspension',
    'scolarite.eleves.manage',
    'scolarite.familles.manage',
    'scolarite.inscription.write',
    'scolarite.suspensions.write',
  ], writeStudents),
  ...policy(['scolarite.cycle.abandon'], {
    permissionsAnyOf: ['abandons.write'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_ABANDON'],
  }),
  ...policy(['scolarite.cycle.transfert'], {
    permissionsAnyOf: ['transferts.write'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_TRANSFERT'],
  }),

  ...policy([
    'finances.analytics.read',
    'finances.arrieres.read',
    'finances.consulter',
    'finances.debt.read',
    'finances.history.read',
    'finances.receipts.list',
    'finances.receipts.read',
    'finances.receipts.reprint',
    'finances.registre.export',
    'finances.registre.read',
    'finances.report.advances.read',
    'finances.report.cashiers.read',
    'finances.report.daily.read',
    'finances.synthese-classe.read',
    'finances.synthese-ecole.read',
    'finances.synthese-organisation.read',
    'finances.synthese-section.read',
  ], readPayments),
  ...policy([
    'finances.exonerations.manage',
    'finances.payments.record',
    'finances.payments.refund',
    'finances.pricing.manage',
    'finances.settings.manage',
  ], writePayments),
  ...policy(['finances.cash.read'], {
    permissionsAnyOf: ['caisse.read'],
    scope: 'CURRENT',
    blockedByRestrictions: ['INTERDICTION_CAISSE', 'INTERDICTION_FINANCES'],
  }),
  ...policy(['finances.cash.open', 'finances.cash.close'], {
    permissionsAnyOf: ['caisse.write'],
    scope: 'CURRENT',
    mutation: true,
    blockedByRestrictions: ['INTERDICTION_CAISSE', 'INTERDICTION_FINANCES'],
  }),

  ...policy(['monitoring.consulter', 'monitoring.state.read'], {
    permissionsAnyOf: ['monitoring.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.dashboard.read'], {
    permissionsAnyOf: ['monitoring.dashboard.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.observability.read'], {
    permissionsAnyOf: ['monitoring.observability.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.health.read'], {
    permissionsAnyOf: ['monitoring.health.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.incidents.read'], {
    permissionsAnyOf: ['monitoring.incidents.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.incidents.open'], {
    permissionsAnyOf: ['monitoring.incidents.create'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['monitoring.incidents.escalate'], {
    permissionsAnyOf: ['monitoring.incidents.escalate'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['monitoring.alerts.read'], {
    permissionsAnyOf: ['monitoring.alerts.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.alerts.create'], {
    permissionsAnyOf: ['monitoring.alerts.create'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['monitoring.alerts.resolve'], {
    permissionsAnyOf: ['monitoring.alerts.resolve'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['monitoring.diagnostics.read'], {
    permissionsAnyOf: ['monitoring.diagnostics.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.capacity.read'], {
    permissionsAnyOf: ['monitoring.capacity.read'],
    scope: 'CURRENT',
  }),
  ...policy(['monitoring.capacity.compute'], {
    permissionsAnyOf: ['monitoring.capacity.calculate'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['monitoring.traces.read'], {
    permissionsAnyOf: ['monitoring.traces.read'],
    scope: 'CURRENT',
  }),

  ...policy(['audit.consulter'], {
    permissionsAnyOf: [
      'audit.read',
      'audit.monitoring.read',
      'audit.analytics.read',
      'audit.security.read',
      'audit.finance.read',
      'audit.technical.read',
      'audit.timeline.read',
    ],
    scope: 'CURRENT',
  }),
  ...policy(['audit.platform.read'], {
    permissionsAnyOf: ['audit.read'],
    scope: 'CURRENT',
  }),
  ...policy(['audit.organization.read'], {
    permissionsAnyOf: ['audit.monitoring.read', 'audit.analytics.read', 'audit.security.read'],
    scope: 'CURRENT',
  }),
  ...policy(['audit.school.financial.read'], {
    permissionsAnyOf: ['audit.finance.read'],
    scope: 'CURRENT',
  }),
  ...policy(['audit.school.technical.read'], {
    permissionsAnyOf: ['audit.technical.read'],
    scope: 'CURRENT',
  }),
  ...policy([
    'audit.pedagogique.bulletins.read',
    'audit.pedagogique.classements.read',
    'audit.pedagogique.conduite.read',
    'audit.pedagogique.cotes.read',
  ], {
    permissionsAnyOf: ['audit.read', 'audit.timeline.read'],
    scope: 'CURRENT',
    derivedForActorCodes: ['ENSEIGNANT'],
    derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
  }),

  ...policy(['configuration.consulter'], {
    permissionsAnyOf: ['configuration.read'],
    scope: 'CURRENT',
  }),
  ...policy(['configuration.platform.runtime.manage'], {
    permissionsAnyOf: ['configuration.update'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['configuration.organization.modules.manage'], {
    permissionsAnyOf: ['configuration.modules.organization.write'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['configuration.school.modules.manage'], {
    permissionsAnyOf: ['configuration.modules.school.write'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy([
    'configuration.school.branding.manage',
    'configuration.school.notifications.manage',
  ], {
    permissionsAnyOf: ['configuration.update'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy([
    'configuration.user.preferences.manage',
    'configuration.user.preferences.self',
  ], {
    scope: 'SELF',
    mutation: true,
  }),

  ...policy(['notifications.consulter'], {
    permissionsAnyOf: ['notifications.read', 'notifications.create', 'notifications.send'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.school.send'], {
    permissionsAnyOf: ['notifications.send'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy([
    'notifications.school.list.read',
    'notifications.school.detail.read',
  ], {
    permissionsAnyOf: ['notifications.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.school.timeline.read'], {
    permissionsAnyOf: ['notifications.timeline.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.school.monitoring.read'], {
    permissionsAnyOf: ['notifications.monitoring.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.school.dead-letter.read'], {
    permissionsAnyOf: ['notifications.dead-letter.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.school.acknowledge'], {
    permissionsAnyOf: ['notifications.acknowledge'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['notifications.school.escalate'], {
    permissionsAnyOf: ['notifications.escalate'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['notifications.school.retry'], {
    permissionsAnyOf: ['notifications.retry.execute'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['notifications.school.replay'], {
    permissionsAnyOf: ['notifications.replay.execute'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['notifications.organization.read'], {
    permissionsAnyOf: [
      'notifications.admin.archives.read',
      'notifications.admin.tenant.read',
      'notifications.admin.escalation.read',
      'notifications.realtime.read',
    ],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.organization.archives.read'], {
    permissionsAnyOf: ['notifications.admin.archives.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.organization.tenant.read'], {
    permissionsAnyOf: ['notifications.admin.tenant.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.organization.escalations.read'], {
    permissionsAnyOf: ['notifications.admin.escalation.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.organization.realtime.read'], {
    permissionsAnyOf: ['notifications.realtime.read'],
    scope: 'CURRENT',
  }),
  ...policy(['notifications.organization.realtime.publish-test'], {
    permissionsAnyOf: ['notifications.realtime.publish'],
    scope: 'CURRENT',
    mutation: true,
  }),

  ...policy(['security.center.read'], {
    permissionsAnyOf: ['security.center.read'],
    scope: 'CURRENT',
  }),
  ...policy(['security.accounts.write'], {
    permissionsAnyOf: ['security.accounts.write'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['security.accounts.lifecycle'], {
    permissionsAnyOf: ['security.accounts.lifecycle'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['security.sessions.revoke'], {
    permissionsAnyOf: ['security.sessions.revoke'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['security.audit.read'], {
    permissionsAnyOf: ['security.audit.read'],
    scope: 'CURRENT',
  }),
  ...policy(['security.roles.manage'], {
    permissionsAllOf: ['roles.write', 'permissions.write'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['security.roles.detail.read'], {
    permissionsAnyOf: ['roles.read'],
    scope: 'CURRENT',
  }),
  ...policy(['security.assignments.manage'], {
    permissionsAnyOf: ['security.assignments.write'],
    scope: 'CURRENT',
    mutation: true,
  }),
  ...policy(['security.assignments.user.read'], {
    permissionsAnyOf: ['security.assignments.read'],
    scope: 'CURRENT',
  }),
  ...policy(['security.titulariats.manage'], {
    permissionsAnyOf: ['security.assignments.read'],
    scope: 'CURRENT',
  }),
  ...policy(['security.checks.run'], {
    permissionsAnyOf: ['security.center.read'],
    scope: 'CURRENT',
  }),
];

export const UI_ACTION_POLICIES: Readonly<Record<string, UiActionPolicy>> =
  Object.freeze(Object.fromEntries(actionPolicyEntries));

const modulePolicy = (
  moduleCode: FrontendModuleCode,
  commercialModule?: CommercialModuleCode,
  moduleRequiredAt: readonly FrontendGovernanceLevel[] = ['ORGANISATION', 'ECOLE'],
): UiModulePolicy => ({
  moduleCode,
  commercialModule,
  moduleRequiredAt,
});

export const UI_MODULE_POLICIES: Readonly<Record<FrontendModuleCode, UiModulePolicy>> = {
  PLATEFORME: modulePolicy('PLATEFORME'),
  ORGANISATION: modulePolicy('ORGANISATION'),
  ADMINISTRATION_ECOLE: modulePolicy('ADMINISTRATION_ECOLE'),
  ACADEMIQUE: modulePolicy('ACADEMIQUE', 'REFERENTIEL_ACADEMIQUE', ['ECOLE']),
  PEDAGOGIQUE: modulePolicy('PEDAGOGIQUE', 'BULLETINS_EVALUATIONS', ['ECOLE']),
  SCOLARITE: modulePolicy('SCOLARITE', 'SCOLARITE_ELEVES', ['ECOLE']),
  FINANCES: modulePolicy('FINANCES', 'PAIEMENTS_FACTURATION', ['ORGANISATION', 'ECOLE']),
  MONITORING: modulePolicy('MONITORING', 'MONITORING', []),
  AUDIT: modulePolicy('AUDIT', 'AUDIT', ['ORGANISATION', 'ECOLE']),
  CONFIGURATION: modulePolicy('CONFIGURATION'),
  NOTIFICATIONS: modulePolicy('NOTIFICATIONS', 'NOTIFICATIONS', ['ORGANISATION', 'ECOLE']),
  SECURITY: modulePolicy('SECURITY'),
};

export function resolveUiActionPolicy(actionCode: string): UiActionPolicy | undefined {
  return UI_ACTION_POLICIES[actionCode];
}

export function resolveUiModulePolicy(moduleCode: FrontendModuleCode): UiModulePolicy | undefined {
  return UI_MODULE_POLICIES[moduleCode];
}
