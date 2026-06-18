import type { AudienceTempsReel, ContexteTempsReel } from '../../domain';

export class PolitiqueAccesRealtimeLocal {
  public autoriser(audience: AudienceTempsReel, contexte: ContexteTempsReel): boolean {
    const permissions = new Set(contexte.permissions);
    const permissionsOk = audience.permissionsRequises.every((permission) =>
      permissions.has(permission.value),
    );
    const organisationOk =
      !audience.organisationId ||
      !contexte.organisationId ||
      audience.organisationId === contexte.organisationId;
    const ecoleOk =
      !audience.ecoleId || !contexte.ecoleId || audience.ecoleId === contexte.ecoleId;
    return permissionsOk && organisationOk && ecoleOk;
  }
}
