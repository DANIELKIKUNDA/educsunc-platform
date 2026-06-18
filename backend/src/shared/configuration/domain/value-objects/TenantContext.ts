import { ExceptionCrossTenantConfiguration } from '../exceptions';

// Ce fichier declare le contexte tenant du module Configuration.

/** Cette interface represente un contexte tenant resolu. */
export interface TenantContextProps {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
}

/** Cette classe represente la frontiere tenant manipulee par le domaine Configuration. */
export class TenantContext {
  private constructor(private readonly props: TenantContextProps) {}

  /** Cette methode cree un contexte tenant metier. */
  public static creer(props: TenantContextProps): TenantContext {
    return new TenantContext({ ...props });
  }

  /** Cette methode verifie qu un autre contexte reste dans la meme frontiere tenant. */
  public verifierCompatibilite(autre: TenantContext): void {
    const courant = this.props;
    const cible = autre.props;

    if (
      courant.organisationId
      && cible.organisationId
      && courant.organisationId !== cible.organisationId
    ) {
      throw new ExceptionCrossTenantConfiguration();
    }

    if (courant.ecoleId && cible.ecoleId && courant.ecoleId !== cible.ecoleId) {
      throw new ExceptionCrossTenantConfiguration();
    }
  }

  /** Cette methode retourne les proprietes du contexte tenant. */
  public valeur(): TenantContextProps {
    return { ...this.props };
  }
}
