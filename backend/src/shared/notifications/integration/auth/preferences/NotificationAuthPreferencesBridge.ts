import type { NotificationAuthContexteActif, NotificationAuthPreferences } from '../NotificationsAuthIntegrationTypes';

// Ce fichier adapte les signaux Auth en contexte de preferences pour Notifications.

/** Cette classe prepare les informations Auth utiles a la resolution future des preferences Notifications. */
export class NotificationAuthPreferencesBridge {
  /** Cette methode construit une vue preference minimale a partir du contexte Auth actif. */
  public construireDepuisContexte(
    contexteActif: NotificationAuthContexteActif | null,
    metadata: Readonly<Record<string, unknown>> = {},
  ): NotificationAuthPreferences {
    return {
      utilisateurId: contexteActif?.utilisateurId,
      sessionId: contexteActif?.sessionId,
      organisationId: contexteActif?.organisationId,
      ecoleId: contexteActif?.ecoleId,
      estOffline: contexteActif?.estOffline ?? false,
      canalPrefere: this.resoudreCanalPrefere(metadata),
      metadata: { ...metadata },
    };
  }

  /** Cette methode fusionne des metadonnees applicatives avec le contexte Auth utile aux preferences. */
  public fusionnerMetadonnees(
    preferences: NotificationAuthPreferences,
    metadonnees: Readonly<Record<string, unknown>> = {},
  ): Readonly<Record<string, unknown>> {
    return {
      ...metadonnees,
      authUtilisateurId: preferences.utilisateurId,
      authSessionId: preferences.sessionId,
      authOrganisationId: preferences.organisationId,
      authEcoleId: preferences.ecoleId,
      authModeOffline: preferences.estOffline,
      authCanalPrefere: preferences.canalPrefere,
    };
  }

  /** Cette methode deduit un canal prefere sans imposer de logique metier a Notifications. */
  private resoudreCanalPrefere(
    metadata: Readonly<Record<string, unknown>>,
  ): NotificationAuthPreferences['canalPrefere'] {
    const canal = metadata.canalPrefere;
    return canal === 'EMAIL' || canal === 'SMS' || canal === 'PUSH' || canal === 'IN_APP' || canal === 'WHATSAPP'
      ? canal
      : undefined;
  }
}
