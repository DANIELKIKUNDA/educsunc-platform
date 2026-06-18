import type { NiveauSanteSysteme } from '../enums';

// Ce fichier declare l etat de saturation d une ressource.

/** Cette interface represente la vue serialisable d une saturation. */
export interface SaturationProps {
  readonly ressource: string;
  readonly taux: number;
  readonly niveau: NiveauSanteSysteme;
  readonly goulot: boolean;
  readonly observeeLe: Date;
}

/** Cette classe represente une saturation detectee par le domaine. */
export class Saturation {
  constructor(private readonly props: SaturationProps) {}

  /** Cette methode indique si la saturation signale un goulot. */
  public estGoulot(): boolean {
    return this.props.goulot;
  }

  /** Cette methode retourne la representation serialisable de la saturation. */
  public valeur(): SaturationProps {
    return { ...this.props };
  }
}
