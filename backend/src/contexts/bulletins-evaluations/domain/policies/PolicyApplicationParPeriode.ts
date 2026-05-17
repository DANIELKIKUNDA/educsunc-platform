import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';

// Cette policy relie l'application uniquement aux periodes simples.
export class PolicyApplicationParPeriode {
  // Cette methode indique si l'application est autorisee pour une periode simple.
  public autoriser(codePeriode: CodePeriodeSimple | CodeColonneBulletin): boolean {
    return Object.values(CodePeriodeSimple).includes(codePeriode as CodePeriodeSimple);
  }
}
