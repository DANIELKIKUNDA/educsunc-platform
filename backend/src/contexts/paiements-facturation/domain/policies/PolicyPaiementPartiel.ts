import { TypeFrais } from '../value-objects/TypeFrais';

// Cette policy controle si le paiement partiel est autorise ou non.
export class PolicyPaiementPartiel {
  public verifier(paiementPartielAutorise: boolean, paiementPartielParTypeFrais: Map<TypeFrais, boolean> | undefined, typeFrais: TypeFrais, montantPaye: number, montantExigible: number): void {
    const autorisationParType = paiementPartielParTypeFrais?.get(typeFrais);
    const partiel = montantPaye < montantExigible;

    if (partiel && !paiementPartielAutorise && autorisationParType !== true) {
      throw new Error('Le paiement partiel est interdit pour ce type de frais.');
    }
  }
}
