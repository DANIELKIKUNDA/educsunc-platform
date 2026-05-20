import { ErreurEcoleNonAutorisee } from '../exceptions/ErreurEcoleNonAutorisee';

export class PolicyScopeEcole {
  public static verifier(ecolesAutorisees: readonly string[], idEcole?: string): void {
    if (!idEcole) {
      return;
    }

    if (!ecolesAutorisees.includes(idEcole)) {
      throw new ErreurEcoleNonAutorisee();
    }
  }
}
