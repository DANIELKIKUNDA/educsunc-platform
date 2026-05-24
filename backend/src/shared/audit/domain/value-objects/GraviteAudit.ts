import { ObjetValeur } from '../../../domain/ValueObject';
import { GRAVITE_AUDIT_ENUM, type GraviteAuditEnum } from '../enums';

export type GraviteAuditValeur = GraviteAuditEnum;

// Ce value object represente la criticite reelle de l'action auditée.
export class GraviteAudit extends ObjetValeur<{ valeur: GraviteAuditValeur }> {
  public static readonly VALEURS = GRAVITE_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!GraviteAudit.VALEURS.includes(valeur as GraviteAuditValeur)) {
      throw new Error(`GraviteAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as GraviteAuditValeur });
  }

  public obtenirValeur(): GraviteAuditValeur {
    return this.proprietes.valeur;
  }
}
