import { ObjetValeur } from '../../../domain/ValueObject';
import { TENANT_AUDIT_SCOPE_ENUM, type TenantAuditScopeEnum } from '../enums';

export type TenantAuditScopeValeur = TenantAuditScopeEnum;

// Ce value object indique la portee multi-tenant de l'audit.
export class TenantAuditScope extends ObjetValeur<{ valeur: TenantAuditScopeValeur }> {
  public static readonly VALEURS = TENANT_AUDIT_SCOPE_ENUM;

  constructor(valeur: string) {
    if (!TenantAuditScope.VALEURS.includes(valeur as TenantAuditScopeValeur)) {
      throw new Error(`TenantAuditScope invalide: ${valeur}`);
    }
    super({ valeur: valeur as TenantAuditScopeValeur });
  }

  public obtenirValeur(): TenantAuditScopeValeur {
    return this.proprietes.valeur;
  }
}
