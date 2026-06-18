import type { NiveauSanteSysteme } from '../enums';

// Ce fichier declare la capacite systeme estimee par Monitoring.

/** Cette interface represente la vue serialisable d une capacite. */
export interface CapaciteSystemeProps {
  readonly ressource: string;
  readonly utilisationActuelle: number;
  readonly capaciteMax: number;
  readonly margeDisponible: number;
  readonly niveau: NiveauSanteSysteme;
  readonly estimeeLe: Date;
}

/** Cette classe represente la capacite disponible d une ressource. */
export class CapaciteSysteme {
  constructor(private readonly props: CapaciteSystemeProps) {}

  /** Cette methode retourne la representation serialisable de la capacite. */
  public valeur(): CapaciteSystemeProps {
    return { ...this.props };
  }
}
