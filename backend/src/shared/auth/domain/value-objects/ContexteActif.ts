import { ObjetValeur } from '../../../domain/ValueObject';

export interface ProprietesContexteActif {
  organisationActiveId?: string;
  ecoleActiveId?: string;
}

// Cet objet valeur porte le contexte actif courant d'un utilisateur.
export class ContexteActif extends ObjetValeur<ProprietesContexteActif> {
  constructor(proprietes: ProprietesContexteActif) {
    const organisationActiveId = ContexteActif.nettoyer(proprietes.organisationActiveId);
    const ecoleActiveId = ContexteActif.nettoyer(proprietes.ecoleActiveId);

    if (ecoleActiveId && !organisationActiveId) {
      throw new Error('Une ecole active exige une organisation active.');
    }

    super({
      organisationActiveId,
      ecoleActiveId,
    });
  }

  // Cette methode retourne l'organisation active si elle existe.
  public obtenirOrganisationActiveId(): string | undefined {
    return this.proprietes.organisationActiveId;
  }

  // Cette methode retourne l'ecole active si elle existe.
  public obtenirEcoleActiveId(): string | undefined {
    return this.proprietes.ecoleActiveId;
  }

  // Cette methode indique si le contexte est vide.
  public estVide(): boolean {
    return !this.proprietes.organisationActiveId && !this.proprietes.ecoleActiveId;
  }

  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
