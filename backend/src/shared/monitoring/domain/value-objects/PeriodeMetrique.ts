// Ce fichier declare une fenetre temporelle de calcul de metriques.

/** Cette interface represente une periode de metrique. */
export interface PeriodeMetriqueProps {
  readonly debut: Date;
  readonly fin: Date;
  readonly fenetreMillisecondes: number;
}

/** Cette classe represente une periode metrique verifiee. */
export class PeriodeMetrique {
  constructor(private readonly props: PeriodeMetriqueProps) {}

  /** Cette methode indique si un instant appartient a la fenetre. */
  public contient(date: Date): boolean {
    return date >= this.props.debut && date <= this.props.fin;
  }

  /** Cette methode retourne la representation serialisable de la periode. */
  public valeur(): PeriodeMetriqueProps {
    return { ...this.props };
  }
}
