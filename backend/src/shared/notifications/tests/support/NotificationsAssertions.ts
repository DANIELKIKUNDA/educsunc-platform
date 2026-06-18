import assert from 'node:assert/strict';
import type { ResultatExecutionWorkerNotifications, SnapshotRuntimeNotifications } from 'shared/notifications';

// Ce fichier centralise des assertions metier reutilisables dans les tests Notifications.

/** Cette classe groupe les assertions frequentes du module Notifications. */
export class NotificationsAssertions {
  /** Cette methode verifie qu'un resultat worker represente un succes reel. */
  public static verifierWorkerReussi(resultat: ResultatExecutionWorkerNotifications): void {
    assert.equal(resultat.succes, true);
    assert.ok(resultat.totalSucces >= 1);
    assert.equal(resultat.totalEchecs, 0);
  }

  /** Cette methode verifie qu'un snapshot runtime contient un composant attendu. */
  public static verifierComposantRuntime(
    snapshot: SnapshotRuntimeNotifications,
    nom: string,
  ): void {
    assert.ok(snapshot.composants.some((composant) => composant.nom === nom));
  }
}
