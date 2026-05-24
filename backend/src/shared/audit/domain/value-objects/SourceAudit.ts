import { ObjetValeur } from '../../../domain/ValueObject';
import { SOURCE_AUDIT_ENUM, type SourceAuditEnum } from '../enums';

export type SourceAuditValeur = SourceAuditEnum;

// Ce value object identifie la source runtime de l'action auditée.
export class SourceAudit extends ObjetValeur<{ valeur: SourceAuditValeur }> {
  public static readonly VALEURS = SOURCE_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!SourceAudit.VALEURS.includes(valeur as SourceAuditValeur)) {
      throw new Error(`SourceAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as SourceAuditValeur });
  }

  public obtenirValeur(): SourceAuditValeur {
    return this.proprietes.valeur;
  }
}
