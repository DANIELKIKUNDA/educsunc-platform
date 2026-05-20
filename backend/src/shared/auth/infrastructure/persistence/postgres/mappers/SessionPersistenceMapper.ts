import { SessionUtilisateur } from '../../../../domain';

export interface SessionUtilisateurRecord {
  id_session_utilisateur: string;
  id_utilisateur: string;
  refresh_token_id: string;
  adresse_ip?: string;
  user_agent?: string;
  device_id?: string;
  est_offline: boolean;
  expire_le?: string;
  revoquee_le?: string;
  raison_revocation?: string;
  dernier_refresh_le?: string;
  organisation_active_id?: string;
  ecole_active_id?: string;
  cree_le: string;
  version: number;
}

// Ce mapper convertit une session AUTH entre domaine et persistance.
export class SessionPersistenceMapper {
  public static versRecord(session: SessionUtilisateur): SessionUtilisateurRecord {
    return {
      id_session_utilisateur: session.obtenirId(),
      id_utilisateur: session.obtenirIdUtilisateur(),
      refresh_token_id: session.obtenirRefreshTokenId(),
      adresse_ip: session.obtenirAdresseIp(),
      user_agent: session.obtenirUserAgent(),
      device_id: session.obtenirDeviceId(),
      est_offline: session.obtenirEstOffline(),
      expire_le: session.obtenirExpireLe()?.toISOString(),
      revoquee_le: session.obtenirRevoqueeLe()?.toISOString(),
      raison_revocation: session.obtenirRaisonRevocation(),
      dernier_refresh_le: session.obtenirDernierRefreshLe()?.toISOString(),
      organisation_active_id: session.obtenirOrganisationActiveId(),
      ecole_active_id: session.obtenirEcoleActiveId(),
      cree_le: session.obtenirCreeLe().toISOString(),
      version: session.obtenirVersion(),
    };
  }

  public static depuisRecord(record: SessionUtilisateurRecord): SessionUtilisateur {
    return new SessionUtilisateur({
      idSessionUtilisateur: record.id_session_utilisateur,
      idUtilisateur: record.id_utilisateur,
      refreshTokenId: record.refresh_token_id,
      adresseIp: record.adresse_ip,
      userAgent: record.user_agent,
      deviceId: record.device_id,
      estOffline: record.est_offline,
      expireLe: record.expire_le ? new Date(record.expire_le) : undefined,
      revoqueeLe: record.revoquee_le ? new Date(record.revoquee_le) : undefined,
      raisonRevocation: record.raison_revocation,
      dernierRefreshLe: record.dernier_refresh_le ? new Date(record.dernier_refresh_le) : undefined,
      organisationActiveId: record.organisation_active_id,
      ecoleActiveId: record.ecole_active_id,
      creeLe: new Date(record.cree_le),
      version: record.version,
    });
  }
}
