import { sessionStore } from '../../shared/auth/session.store';
import { activeContextStore } from '../../shared/session/active-context.store';

export interface OfflineTenantContext {
  partitionKey: string;
  userId: string;
  organizationId: string;
  schoolId: string;
  schoolYearId: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function buildOfflinePartitionKey(input: {
  userId: string;
  organizationId: string;
  schoolId: string;
  schoolYearId: string;
}): Promise<string> {
  const canonical = [input.userId, input.organizationId, input.schoolId, input.schoolYearId]
    .map((value) => value.trim())
    .join('\u001f');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return bytesToHex(new Uint8Array(digest));
}

export async function readActiveOfflineContext(
  schoolYearIdOverride?: string,
): Promise<OfflineTenantContext | null> {
  const userId = sessionStore.state.userId.trim();
  const organizationId = activeContextStore.state.organizationId.trim();
  const schoolId = activeContextStore.state.schoolId.trim();
  const schoolYearId = schoolYearIdOverride?.trim() || activeContextStore.state.schoolYearId.trim();
  if (
    !sessionStore.state.isAuthenticated
    || !userId
    || !organizationId
    || !schoolId
    || !schoolYearId
  ) {
    return null;
  }

  return {
    partitionKey: await buildOfflinePartitionKey({ userId, organizationId, schoolId, schoolYearId }),
    userId,
    organizationId,
    schoolId,
    schoolYearId,
  };
}
