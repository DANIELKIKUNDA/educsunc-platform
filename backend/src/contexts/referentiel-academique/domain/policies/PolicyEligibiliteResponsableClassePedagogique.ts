import { ErreurResponsabiliteClassePedagogiqueInvalide } from '../exceptions/ErreurResponsabiliteClassePedagogiqueInvalide';

// Cette policy protege l'attribution de la responsabilite de classe aux seuls enseignants actifs du bon scope.
export class PolicyEligibiliteResponsableClassePedagogique {
  public verifier(params: {
    utilisateurExiste: boolean;
    utilisateurActif: boolean;
    codeRoleActif?: string;
    memeOrganisation: boolean;
    memeEcole: boolean;
  }): void {
    if (!params.utilisateurExiste) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        "Le responsable de classe cible doit correspondre a un utilisateur existant.",
      );
    }

    if (!params.utilisateurActif) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        "Le responsable de classe cible doit disposer d'une affectation active.",
      );
    }

    if (params.codeRoleActif !== 'ENSEIGNANT') {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        "Le responsable de classe cible doit disposer d'une affectation active ENSEIGNANT.",
      );
    }

    if (!params.memeOrganisation) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        "Le responsable de classe cible doit appartenir a la meme organisation que la classe pedagogique.",
      );
    }

    if (!params.memeEcole) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        "Le responsable de classe cible doit appartenir a la meme ecole que la classe pedagogique.",
      );
    }
  }
}
