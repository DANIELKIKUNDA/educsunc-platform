import type {
  SecurityAffectationItem,
  SecurityRoleItem,
  SecurityRolePermissionsItem,
  SecurityRoleRestrictionsItem,
  SecurityScopeItem,
  SecurityTitulariatItem,
} from '../models/security.model';

export function lireEnveloppe<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;

    if ('donnees' in candidate) {
      return (candidate.donnees as T) ?? fallback;
    }

    if ('data' in candidate) {
      return (candidate.data as T) ?? fallback;
    }
  }

  return (payload as T) ?? fallback;
}

export function lireRoles(payload: unknown): readonly SecurityRoleItem[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as SecurityRoleItem[]) : [];
}

export function lirePermissionsRole(payload: unknown): SecurityRolePermissionsItem | null {
  return lireEnveloppe<SecurityRolePermissionsItem | null>(payload, null);
}

export function lireRestrictionsRole(payload: unknown): SecurityRoleRestrictionsItem | null {
  const data = lireEnveloppe<unknown>(payload, null);

  if (!data || typeof data !== 'object') {
    return null;
  }

  const candidate = data as Record<string, unknown>;
  if (typeof candidate.codeRole !== 'string' || !Array.isArray(candidate.restrictions)) {
    return null;
  }

  return {
    codeRole: candidate.codeRole,
    restrictions: candidate.restrictions.map((item) => String(item)),
  };
}

export function lireAffectations(payload: unknown): readonly SecurityAffectationItem[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as SecurityAffectationItem[]) : [];
}

export function lireScopes(payload: unknown): readonly SecurityScopeItem[] {
  const data = lireEnveloppe<unknown>(payload, []);
  return Array.isArray(data) ? (data as SecurityScopeItem[]) : [];
}

export function lireTitulariat(payload: unknown): SecurityTitulariatItem | boolean | null {
  const data = lireEnveloppe<unknown>(payload, null);

  if (typeof data === 'boolean') {
    return data;
  }

  return (data as SecurityTitulariatItem | null) ?? null;
}

export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function resumeRoles(roles: readonly SecurityRoleItem[]): string {
  return `${roles.length} role(s)`;
}

export function resumeAffectations(affectations: readonly SecurityAffectationItem[]): string {
  return `${affectations.length} affectation(s)`;
}
