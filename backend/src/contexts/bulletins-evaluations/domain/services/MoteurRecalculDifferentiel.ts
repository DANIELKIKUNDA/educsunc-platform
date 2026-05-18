import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Ce moteur determine le plus petit ensemble de recalculs necessaires apres modification.
export class MoteurRecalculDifferentiel {
  // Cette methode retourne les actions cibleses a executer apres une modification.
  public determinerActions(codeColonne: CodeColonneBulletin): string[] {
    const actions = [
      `RECALCUL_FICHE_${codeColonne}`,
      `RECALCUL_RESULTAT_${codeColonne}`,
      `RECALCUL_CLASSEMENT_${codeColonne}`,
      `MISE_A_JOUR_BULLETIN_${codeColonne}`,
    ];

    if (codeColonne === CodeColonneBulletin.EX1) {
      actions.push(
        `RECALCUL_RESULTAT_${CodeColonneBulletin.TOTAL_S1}`,
        `RECALCUL_CLASSEMENT_${CodeColonneBulletin.TOTAL_S1}`,
      );
    }

    if (codeColonne === CodeColonneBulletin.P1) {
      actions.push(`MISE_A_JOUR_PROCLAMATION_${CodeColonneBulletin.P1}`);
    }

    return actions;
  }
}
