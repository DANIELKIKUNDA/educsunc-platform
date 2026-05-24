import { Entite } from '../../../domain/Entity';
import { TenantAuditScope } from '../value-objects';

export interface ProprietesTenantAudit {
  idTenantAudit: string;
  scope: TenantAuditScope;
  organisationId?: string;
  ecoleId?: string;
  scopeActif?: string;
}

// Cette entité porte l'isolation multi-tenant officielle de l'audit.
export class TenantAudit extends Entite<string> {
  private readonly scope: TenantAuditScope;
  private readonly organisationId?: string;
  private readonly ecoleId?: string;
  private readonly scopeActif?: string;

  constructor(proprietes: ProprietesTenantAudit) {
    super(TenantAudit.validerTexte(proprietes.idTenantAudit, 'idTenantAudit'));
    this.scope = proprietes.scope;
    this.organisationId = TenantAudit.nettoyerOptionnel(proprietes.organisationId);
    this.ecoleId = TenantAudit.nettoyerOptionnel(proprietes.ecoleId);
    this.scopeActif = TenantAudit.nettoyerOptionnel(proprietes.scopeActif);
  }

  public obtenirScope(): TenantAuditScope { return this.scope; }
  public obtenirOrganisationId(): string | undefined { return this.organisationId; }
  public obtenirEcoleId(): string | undefined { return this.ecoleId; }
  public obtenirScopeActif(): string | undefined { return this.scopeActif; }

  private static validerTexte(valeur: string, champ: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${champ} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
