import { ObjetValeur } from '../../../domain/ValueObject';
import { ACTION_AUDIT_ENUM, type ActionAuditEnum } from '../enums';

export type ActionAuditValeur = ActionAuditEnum;

// Ce value object impose un vocabulaire stable pour les actions auditées.
export class ActionAudit extends ObjetValeur<{ valeur: ActionAuditValeur }> {
  public static readonly VALEURS = ACTION_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!ActionAudit.VALEURS.includes(valeur as ActionAuditValeur)) {
      throw new Error(`ActionAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as ActionAuditValeur });
  }

  public obtenirValeur(): ActionAuditValeur {
    return this.proprietes.valeur;
  }
}
