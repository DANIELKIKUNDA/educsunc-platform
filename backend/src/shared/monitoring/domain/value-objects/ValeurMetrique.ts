// Ce fichier declare la valeur metier d une metrique.

/** Cette interface represente la structure brute d une valeur de metrique. */
export interface ValeurMetriqueProps {
  readonly valeur: number;
  readonly unite: string;
  readonly horodatage: Date;
}

/** Cette classe represente une valeur de metrique verifiee. */
export class ValeurMetrique {
  constructor(private readonly props: ValeurMetriqueProps) {}

  /** Cette methode retourne la valeur numerique de la mesure. */
  public mesure(): number {
    return this.props.valeur;
  }

  /** Cette methode retourne la representation serialisable de la mesure. */
  public valeur(): ValeurMetriqueProps {
    return { ...this.props };
  }
}
