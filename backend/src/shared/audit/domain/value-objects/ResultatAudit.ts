import { ObjetValeur } from '../../../domain/ValueObject';
import { RESULTAT_AUDIT_ENUM, type ResultatAuditEnum } from '../enums';

export type ResultatAuditValeur = ResultatAuditEnum;

// Ce value object decrit l'issue finale de l'action auditée.
export class ResultatAudit extends ObjetValeur<{ valeur: ResultatAuditValeur }> {
  public static readonly VALEURS = RESULTAT_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!ResultatAudit.VALEURS.includes(valeur as ResultatAuditValeur)) {
      throw new Error(`ResultatAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as ResultatAuditValeur });
  }

  public obtenirValeur(): ResultatAuditValeur {
    return this.proprietes.valeur;
  }
}
