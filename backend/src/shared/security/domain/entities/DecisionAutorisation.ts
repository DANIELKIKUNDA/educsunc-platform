import { Entite } from '../../../domain/Entity';
import { PermissionSecurite } from '../value-objects/PermissionSecurite';

export interface ProprietesDecisionAutorisation {
  autorise: boolean;
  permissionDemandee: PermissionSecurite;
  raisonRefus?: string;
  scopeValide: boolean;
  restrictionRespectee: boolean;
}

// Cette entite porte la conclusion metier d'une decision d'autorisation.
export class DecisionAutorisation extends Entite<string> {
  private autorise: boolean;
  private permissionDemandee: PermissionSecurite;
  private raisonRefus?: string;
  private scopeValide: boolean;
  private restrictionRespectee: boolean;

  constructor(proprietes: ProprietesDecisionAutorisation) {
    super('decision-autorisation');
    this.autorise = Boolean(proprietes.autorise);
    this.permissionDemandee = proprietes.permissionDemandee;
    this.raisonRefus = DecisionAutorisation.nettoyerOptionnel(proprietes.raisonRefus);
    this.scopeValide = Boolean(proprietes.scopeValide);
    this.restrictionRespectee = Boolean(proprietes.restrictionRespectee);
  }

  public estAutorise(): boolean {
    return this.autorise;
  }

  public obtenirPermissionDemandee(): PermissionSecurite {
    return this.permissionDemandee;
  }

  public obtenirRaisonRefus(): string | undefined {
    return this.raisonRefus;
  }

  public obtenirScopeValide(): boolean {
    return this.scopeValide;
  }

  public obtenirRestrictionRespectee(): boolean {
    return this.restrictionRespectee;
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre === '' ? undefined : propre;
  }
}
