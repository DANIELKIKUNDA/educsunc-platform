import { createHash } from 'node:crypto';
import type { AuditReadCursorPosition, AuditReadFilters } from '../ports/outbound/AuditReadRepositoryPort';
import { AuditValidationException } from '../exceptions/communes/AuditValidationException';

interface AuditCursorPayload extends AuditReadCursorPosition {
  readonly version: 1;
  readonly empreinte: string;
}

export class AuditReadCursorCodec {
  public empreinte(filtres: AuditReadFilters): string {
    const normalise = Object.fromEntries(
      Object.entries(filtres)
        .filter(([, valeur]) => valeur !== undefined)
        .sort(([gauche], [droite]) => gauche.localeCompare(droite)),
    );
    return createHash('sha256').update(JSON.stringify(normalise)).digest('base64url');
  }

  public encoder(position: AuditReadCursorPosition, empreinte: string): string {
    return Buffer.from(JSON.stringify({ version: 1, ...position, empreinte } satisfies AuditCursorPayload))
      .toString('base64url');
  }

  public decoder(cursor: string | undefined, empreinte: string): AuditReadCursorPosition | undefined {
    if (!cursor) return undefined;
    if (cursor.length > 1_024 || !/^[A-Za-z0-9_-]+$/.test(cursor)) {
      throw new AuditValidationException('Le curseur de pagination est invalide.');
    }
    try {
      const valeur = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<AuditCursorPayload>;
      if (
        valeur.version !== 1
        || valeur.empreinte !== empreinte
        || typeof valeur.idAuditEntry !== 'string'
        || valeur.idAuditEntry.length === 0
        || typeof valeur.dateAction !== 'string'
        || Number.isNaN(Date.parse(valeur.dateAction))
      ) {
        throw new Error('CURSOR_INVALID');
      }
      return { dateAction: new Date(valeur.dateAction).toISOString(), idAuditEntry: valeur.idAuditEntry };
    } catch {
      throw new AuditValidationException('Le curseur de pagination est invalide ou ne correspond plus a cette recherche.');
    }
  }
}
