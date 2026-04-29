import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';
import { TypeFrais } from '../value-objects/TypeFrais';

export class MoteurFraisExigibles {
  public determiner(obligations: ObligationFinanciereEleve[], typeFrais?: TypeFrais): ObligationFinanciereEleve[] {
    return obligations.filter((obligation) => !obligation.estSoldee() && (typeFrais === undefined || obligation.obtenirTypeFrais() === typeFrais));
  }
}
