import type {
  AuditAuthorizedScope,
  AuditControllerRuntimeContext,
} from './HttpAuditControllerTypes';

type TenantScopedInput = {
  readonly organisationId?: string;
  readonly ecoleId?: string;
};

// Le perimetre authentifie reste prioritaire sur tout filtre fourni par le client.
export class AuditTenantScopePolicy {
  public static appliquer<T extends TenantScopedInput>(
    input: T,
    contexte: AuditControllerRuntimeContext,
  ): T {
    switch (contexte.authorizedScope) {
      case 'PLATEFORME':
        return { ...input };
      case 'ORGANISATION':
        return {
          ...input,
          organisationId: contexte.organisationId,
        };
      case 'ECOLE':
        return {
          ...input,
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
        };
    }
  }

  public static inferer(
    scopeExplicite: AuditAuthorizedScope | undefined,
    organisationId: string | undefined,
    ecoleId: string | undefined,
  ): AuditAuthorizedScope {
    if (scopeExplicite) {
      return scopeExplicite;
    }
    if (ecoleId) {
      return 'ECOLE';
    }
    if (organisationId) {
      return 'ORGANISATION';
    }
    return 'PLATEFORME';
  }
}
