import type { ContexteActifOutput, SessionOutput, UtilisateurAuthDTO } from 'shared/auth/application';
import type { NotificationContext } from '../../../context';
import type {
  NotificationAuthContexteActif,
  NotificationAuthDemandeAutorisation,
} from '../NotificationsAuthIntegrationTypes';

// Ce fichier traduit les donnees Auth vers des structures exploitables par Notifications.

/** Cette classe convertit les DTO Auth en contexte stable pour le module Notifications. */
export class NotificationAuthContextMapper {
  /** Cette methode construit un contexte actif Notifications a partir des donnees Auth. */
  public static depuisAuth(
    utilisateur: UtilisateurAuthDTO,
    contexteActif: ContexteActifOutput,
    session?: SessionOutput,
    acteurId?: string,
    deviceId?: string,
  ): NotificationAuthContexteActif {
    return {
      utilisateurId: utilisateur.idUtilisateur,
      acteurId: acteurId ?? utilisateur.idUtilisateur,
      sessionId: session?.sessionId,
      organisationId: session?.organisationActiveId ?? contexteActif.organisationActiveId,
      ecoleId: session?.ecoleActiveId ?? contexteActif.ecoleActiveId,
      deviceId,
      estOffline: session?.estOffline ?? false,
    };
  }

  /** Cette methode enrichit une base de contexte Notifications avec les donnees Auth actives. */
  public static versContexteNotification(
    base: Omit<
      NotificationContext,
      'utilisateurId' | 'acteurId' | 'sessionId' | 'deviceId' | 'organisationId' | 'ecoleId'
    > & {
      readonly organisationId?: string;
      readonly ecoleId?: string;
    },
    contexteActif: NotificationAuthContexteActif,
  ): NotificationContext {
    return {
      ...base,
      utilisateurId: contexteActif.utilisateurId,
      acteurId: contexteActif.acteurId,
      sessionId: contexteActif.sessionId,
      deviceId: contexteActif.deviceId,
      organisationId: base.organisationId ?? contexteActif.organisationId,
      ecoleId: base.ecoleId ?? contexteActif.ecoleId,
    };
  }

  /** Cette methode normalise une demande d'autorisation avant evaluation par le bridge Auth. */
  public static versDemandeAutorisation(
    action: string,
    contexte: Readonly<Record<string, unknown>>,
  ): NotificationAuthDemandeAutorisation {
    return {
      action,
      utilisateurId: typeof contexte.utilisateurId === 'string' ? contexte.utilisateurId : undefined,
      sessionId: typeof contexte.sessionId === 'string' ? contexte.sessionId : undefined,
      organisationId:
        typeof contexte.organisationId === 'string' ? contexte.organisationId : undefined,
      ecoleId: typeof contexte.ecoleId === 'string' ? contexte.ecoleId : undefined,
      metadata: { ...contexte },
    };
  }
}
