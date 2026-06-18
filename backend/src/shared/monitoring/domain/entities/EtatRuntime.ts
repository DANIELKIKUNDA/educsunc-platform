import type { NiveauSanteSysteme } from '../enums';

// Ce fichier declare l etat du runtime de supervision.

/** Cette interface represente la vue serialisable du runtime. */
export interface EtatRuntimeProps {
  readonly niveau: NiveauSanteSysteme;
  readonly filesActives: readonly string[];
  readonly workersActifs: readonly string[];
  readonly jobsEnCours: number;
  readonly jobsEnRetard: number;
  readonly misAJourLe: Date;
}

/** Cette classe represente l etat du runtime Monitoring. */
export class EtatRuntime {
  constructor(private readonly props: EtatRuntimeProps) {}

  /** Cette methode retourne la representation serialisable du runtime. */
  public valeur(): EtatRuntimeProps {
    return {
      ...this.props,
      filesActives: [...this.props.filesActives],
      workersActifs: [...this.props.workersActifs],
    };
  }
}
