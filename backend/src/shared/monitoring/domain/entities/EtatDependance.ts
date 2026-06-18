import type { NiveauSanteSysteme, SourceTechnique } from '../enums';

// Ce fichier declare l etat d une dependance technique.

/** Cette interface represente la vue serialisable d une dependance. */
export interface EtatDependanceProps {
  readonly nom: string;
  readonly source: SourceTechnique;
  readonly niveau: NiveauSanteSysteme;
  readonly disponible: boolean;
  readonly message: string;
  readonly verifieLe: Date;
}

/** Cette classe represente une dependance technique observee. */
export class EtatDependance {
  constructor(private readonly props: EtatDependanceProps) {}

  /** Cette methode retourne la representation serialisable de la dependance. */
  public valeur(): EtatDependanceProps {
    return { ...this.props };
  }
}
