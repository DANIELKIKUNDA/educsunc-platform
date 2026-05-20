import { ErreurTokenVersionInvalide } from '../exceptions/ErreurTokenVersionInvalide';

// Cette policy porte la regle d'invalidation des anciens JWT apres changement critique.
export class PolicyTokenVersion {
  public static verifier(versionCourante: number, versionToken: number): void {
    if (versionToken !== versionCourante) {
      throw new ErreurTokenVersionInvalide();
    }
  }

  public static doitInvaliderAnciennesSessions(changementCritique = true): boolean {
    return changementCritique;
  }
}
