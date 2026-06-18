import { EtatSysteme } from './EtatSysteme';

// Ce fichier declare l instantane de sante consolide.

/** Cette interface represente la vue serialisable d un instantane de sante. */
export interface InstantaneSanteDetails {
  readonly etat: ReturnType<EtatSysteme['details']>;
  readonly captureLe: Date;
  readonly scoreDisponibilite: number;
}

/** Cette classe represente un snapshot de sante global. */
export class InstantaneSante {
  constructor(
    private readonly etat: EtatSysteme,
    private readonly captureLe = new Date(),
    private readonly scoreDisponibilite = 100,
  ) {}

  /** Cette methode retourne la vue serialisable du snapshot. */
  public details(): InstantaneSanteDetails {
    return {
      etat: this.etat.details(),
      captureLe: this.captureLe,
      scoreDisponibilite: this.scoreDisponibilite,
    };
  }
}
