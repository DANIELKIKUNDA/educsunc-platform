import { PERMISSIONS_SECURITE, type PermissionSecuriteValeur } from '../value-objects/PermissionSecurite';
import type { CodeRoleSystemeValeur } from '../value-objects/CodeRole';
import type { NiveauAccesValeur } from '../value-objects/NiveauAcces';

export interface DefinitionRoleSysteme {
  readonly code: CodeRoleSystemeValeur;
  readonly libelle: string;
  readonly niveau: NiveauAccesValeur;
  readonly permissions: readonly PermissionSecuriteValeur[];
}

const lecturePlateforme: PermissionSecuriteValeur[] = [
  'referentiel.read', 'audit.read', 'audit.security.read', 'monitoring.read',
  'monitoring.dashboard.read', 'monitoring.observability.read', 'monitoring.health.read',
  'monitoring.health.snapshot.read', 'monitoring.incidents.read', 'monitoring.alerts.read',
  'monitoring.diagnostics.read', 'monitoring.capacity.read', 'monitoring.traces.read',
  'configuration.read', 'configuration.effective.read',
  'configuration.modules.read', 'security.center.read', 'security.accounts.read',
  'security.admin.organizations.read', 'security.admin.schools.read', 'security.roles.read',
  'security.assignments.read', 'security.sessions.read', 'security.attempts.read',
  'security.audit.read', 'security.policies.read',
];

const operationsMonitoringPlateforme: PermissionSecuriteValeur[] = [
  'monitoring.incidents.create', 'monitoring.incidents.escalate',
  'monitoring.alerts.create', 'monitoring.alerts.resolve',
  'monitoring.diagnostics.create', 'monitoring.capacity.calculate',
  'monitoring.saturation.calculate', 'monitoring.traces.create',
];

const administrationSecuritePlateforme: PermissionSecuriteValeur[] = [
  'security.accounts.write', 'security.accounts.lifecycle',
  'security.admin.organizations.write', 'security.admin.schools.emergency.write',
  'security.roles.write', 'security.assignments.write', 'security.sessions.revoke',
  'security.accounts.unlock', 'roles.write', 'permissions.write', 'utilisateurs.write',
];

const administrationOrganisation: PermissionSecuriteValeur[] = [
  'referentiel.read', 'utilisateurs.read', 'utilisateurs.write', 'roles.read',
  'permissions.read', 'configuration.read', 'configuration.update',
  'configuration.modules.read', 'configuration.modules.organization.write',
  'security.center.read', 'security.accounts.read', 'security.accounts.write',
  'security.accounts.lifecycle', 'security.admin.schools.read',
  'security.admin.schools.write',
  'security.assignments.read', 'security.assignments.write', 'security.sessions.read',
  'security.sessions.revoke', 'security.attempts.read', 'security.accounts.unlock',
  'security.audit.read',
];

const administrationEcole: PermissionSecuriteValeur[] = [
  'referentiel.read', 'referentiel.write', 'utilisateurs.read', 'utilisateurs.write',
  'roles.read', 'permissions.read', 'configuration.read', 'configuration.update',
  'configuration.modules.read', 'configuration.modules.school.write',
  'security.center.read', 'security.accounts.read', 'security.accounts.write',
  'security.accounts.lifecycle', 'security.assignments.read', 'security.assignments.write',
  'security.sessions.read', 'security.sessions.revoke', 'security.attempts.read',
  'security.accounts.unlock', 'security.audit.read',
];

export const CATALOGUE_ROLES_SYSTEME: readonly DefinitionRoleSysteme[] = [
  { code: 'MANAGER_SYSTEME', libelle: 'Manager système', niveau: 'PLATEFORME', permissions: [...PERMISSIONS_SECURITE] },
  { code: 'OPERATEUR_SYSTEME', libelle: 'Opérateur système', niveau: 'PLATEFORME', permissions: [...lecturePlateforme, ...operationsMonitoringPlateforme, ...administrationSecuritePlateforme, 'referentiel.write', 'configuration.create', 'configuration.update', 'configuration.validate'] },
  { code: 'SUPPORT_SYSTEME', libelle: 'Support système', niveau: 'PLATEFORME', permissions: lecturePlateforme },
  { code: 'PROMOTEUR_ORGANISATION', libelle: 'Promoteur organisation', niveau: 'ORGANISATION', permissions: ['referentiel.read', 'eleves.read', 'paiements.read', 'utilisateurs.read', 'audit.monitoring.read', 'audit.analytics.read', 'audit.security.read', 'configuration.read', 'configuration.modules.read', 'security.center.read', 'security.admin.schools.read', 'security.audit.read'] },
  { code: 'ADMIN_SYSTEME_ORGANISATION', libelle: 'Administrateur système organisation', niveau: 'ORGANISATION', permissions: administrationOrganisation },
  { code: 'GESTIONNAIRE_ORGANISATION', libelle: 'Gestionnaire organisation', niveau: 'ORGANISATION', permissions: ['referentiel.read', 'eleves.read', 'paiements.read', 'utilisateurs.read', 'audit.monitoring.read', 'audit.analytics.read', 'configuration.read', 'configuration.modules.read'] },
  { code: 'ADMINISTRATEUR_ECOLE', libelle: 'Administrateur école', niveau: 'ECOLE', permissions: ['eleves.read', 'paiements.read', 'caisse.read', 'audit.finance.read', 'configuration.read', 'configuration.modules.read'] },
  { code: 'ADMIN_SYSTEME_ECOLE', libelle: 'Administrateur système école', niveau: 'ECOLE', permissions: administrationEcole },
  { code: 'PREFET_ETUDES', libelle: 'Préfet des études', niveau: 'ECOLE', permissions: ['bulletins.read', 'eleves.read', 'eleves.write', 'abandons.write', 'transferts.write', 'paiements.read', 'referentiel.read'] },
  { code: 'DIRECTEUR_ETUDES', libelle: 'Directeur des études', niveau: 'ECOLE', permissions: ['bulletins.read', 'eleves.read', 'eleves.write', 'paiements.read'] },
  { code: 'DIRECTEUR_DISCIPLINE', libelle: 'Directeur de discipline', niveau: 'ECOLE', permissions: ['eleves.read', 'eleves.write', 'convocations.send', 'paiements.read', 'cotes.write'] },
  { code: 'DIRECTEUR_PRIMAIRE', libelle: 'Directeur primaire', niveau: 'ECOLE', permissions: ['eleves.read', 'eleves.write', 'paiements.read', 'paiements.write'] },
  { code: 'DIRECTEUR_MATERNELLE', libelle: 'Directeur maternelle', niveau: 'ECOLE', permissions: ['eleves.read', 'eleves.write', 'paiements.read', 'paiements.write'] },
  { code: 'ENSEIGNANT', libelle: 'Enseignant', niveau: 'ECOLE', permissions: ['cotes.read', 'cotes.write', 'bulletins.read', 'referentiel.read', 'eleves.read', 'paiements.read'] },
  { code: 'SECRETAIRE', libelle: 'Secrétaire', niveau: 'ECOLE', permissions: ['eleves.read', 'paiements.read'] },
  { code: 'CAISSIER', libelle: 'Caissier', niveau: 'ECOLE', permissions: ['paiements.write', 'paiements.read', 'caisse.write', 'caisse.read', 'audit.finance.read'] },
  { code: 'COMPTABLE', libelle: 'Comptable', niveau: 'ECOLE', permissions: ['paiements.read', 'caisse.read', 'audit.finance.read'] },
  { code: 'PARENT', libelle: 'Parent', niveau: 'ECOLE', permissions: ['bulletins.read', 'paiements.read', 'eleves.read', 'notifications.send'] },
] as const;

export function obtenirDefinitionRoleSysteme(code: string): DefinitionRoleSysteme | undefined {
  return CATALOGUE_ROLES_SYSTEME.find((role) => role.code === code);
}
