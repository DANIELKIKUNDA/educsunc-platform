import type { AuditSynchronizationCursor } from '../SynchronizationTypes';

const cursors = new Map<string, AuditSynchronizationCursor>();

function cursorKey(cursor: {
  organisationId?: string;
  ecoleId?: string;
  scope?: string;
  deviceId?: string;
}): string {
  return [cursor.organisationId ?? 'NA', cursor.ecoleId ?? 'NA', cursor.scope ?? 'NA', cursor.deviceId ?? 'NA'].join('|');
}

// Le dernier curseur sync permet une synchronisation incrementale au lieu d une resynchronisation totale.
export class IncrementalSynchronizationCursorStore {
  public lire(args: {
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    deviceId?: string;
  }): AuditSynchronizationCursor | null {
    return cursors.get(cursorKey(args)) ?? null;
  }

  public ecrire(cursor: AuditSynchronizationCursor): void {
    cursors.set(cursorKey(cursor), cursor);
  }
}
