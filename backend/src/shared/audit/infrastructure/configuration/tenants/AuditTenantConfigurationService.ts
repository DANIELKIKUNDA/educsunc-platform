import type { AuditConfigurationScope } from '../ConfigurationTypes';

export class AuditTenantConfigurationService {
  public composerCle(scope: AuditConfigurationScope): string {
    return [
      scope.niveau,
      scope.environnement ?? '',
      scope.organisationId ?? '',
      scope.ecoleId ?? '',
    ].join('|');
  }

  public resoudreScopesApplicables(scope: AuditConfigurationScope): AuditConfigurationScope[] {
    const scopes: AuditConfigurationScope[] = [{ niveau: 'GLOBAL' }];
    if (scope.environnement) {
      scopes.push({ niveau: 'ENVIRONNEMENT', environnement: scope.environnement });
    }
    if (scope.organisationId) {
      scopes.push({
        niveau: 'ORGANISATION',
        environnement: scope.environnement,
        organisationId: scope.organisationId,
      });
    }
    if (scope.ecoleId) {
      scopes.push({
        niveau: 'ECOLE',
        environnement: scope.environnement,
        organisationId: scope.organisationId,
        ecoleId: scope.ecoleId,
      });
    }

    return scopes;
  }
}
