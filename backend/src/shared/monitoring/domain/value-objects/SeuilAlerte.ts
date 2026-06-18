import type { GraviteAlerte } from '../enums';

// Ce fichier declare le seuil de declenchement d une alerte.

/** Cette interface represente les bornes d evaluation d une alerte. */
export interface SeuilAlerteProps {
  readonly indicateur: string;
  readonly warning: number;
  readonly critical: number;
  readonly unite: string;
  readonly graviteParDefaut: GraviteAlerte;
}

/** Cette classe represente un seuil de declenchement verifie. */
export class SeuilAlerte {
  constructor(private readonly props: SeuilAlerteProps) {}

  /** Cette methode evalue une valeur de metrique face au seuil. */
  public evaluer(valeur: number): GraviteAlerte | null {
    if (valeur >= this.props.critical) {
      return 'CRITICAL';
    }
    if (valeur >= this.props.warning) {
      return this.props.graviteParDefaut;
    }
    return null;
  }

  /** Cette methode retourne la representation serialisable du seuil. */
  public valeur(): SeuilAlerteProps {
    return { ...this.props };
  }
}
