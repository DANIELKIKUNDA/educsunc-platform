import { AuditSnapshotForbiddenException } from '../exceptions';
import { ActionAudit, AuditSnapshotData } from '../value-objects';

// Cette policy limite l'usage des snapshots aux actions qui en ont réellement besoin.
export class PolicyAuditSnapshots {
  public static verifier(actionAudit: ActionAudit, snapshots?: AuditSnapshotData): void {
    const action = actionAudit.obtenirValeur();
    const actionsAutorisantSnapshots = ['PAIEMENT_ANNULE', 'COTE_MODIFIEE', 'REFERENTIEL_MODIFIE', 'PONDERATION_MODIFIEE'];
    if (snapshots && !actionsAutorisantSnapshots.includes(action)) {
      throw new AuditSnapshotForbiddenException(`Les snapshots ne sont pas attendus pour l'action ${action}.`);
    }
  }
}
