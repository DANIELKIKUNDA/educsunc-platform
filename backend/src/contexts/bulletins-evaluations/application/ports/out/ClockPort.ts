// Ce port abstrait l'horloge pour rendre les use cases testables.
export interface ClockPort {
  maintenant(): Date;
}
