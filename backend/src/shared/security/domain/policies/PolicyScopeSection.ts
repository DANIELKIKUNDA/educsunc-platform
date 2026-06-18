import { ErreurSectionNonAutorisee } from '../exceptions/ErreurSectionNonAutorisee';

export class PolicyScopeSection {
  public static verifier(sectionsAutorisees: readonly string[], idSection?: string): void {
    if (!idSection) {
      return;
    }

    if (!sectionsAutorisees.includes(idSection)) {
      throw new ErreurSectionNonAutorisee();
    }
  }
}
