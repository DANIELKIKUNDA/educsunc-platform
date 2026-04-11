import { ValidationError } from '../../../../shared/exceptions/ValidationError';

// Cette policy porte les regles globales de tracabilite et de journalisation des actions metier.
export class PolicyAudit {
  // Cette methode impose une tracabilite minimale exploitable pour chaque action metier sensible.
  public verifierTracabiliteObligatoire(
    action: string,
    acteur: string | undefined,
    horodatage: Date | undefined,
  ): void {
    if (action.trim().length === 0) {
      throw new ValidationError(
        'La tracabilite impose une action metier explicite.',
        'POLICY_AUDIT_ACTION_INVALIDE',
      );
    }

    if (acteur === undefined || acteur.trim().length === 0) {
      throw new ValidationError(
        'La tracabilite impose un acteur explicite.',
        'POLICY_AUDIT_ACTEUR_OBLIGATOIRE',
      );
    }

    if (
      horodatage === undefined
      || !(horodatage instanceof Date)
      || Number.isNaN(horodatage.getTime())
    ) {
      throw new ValidationError(
        'La tracabilite impose un horodatage valide.',
        'POLICY_AUDIT_HORODATAGE_INVALIDE',
      );
    }
  }

  // Cette methode impose la journalisation de toute action critique.
  public verifierJournalisationActionsCritiques(
    action: string,
    estCritique: boolean,
    estJournalisee: boolean,
  ): void {
    if (action.trim().length === 0) {
      throw new ValidationError(
        'Une action critique doit etre identifiee clairement avant journalisation.',
        'POLICY_AUDIT_ACTION_CRITIQUE_INVALIDE',
      );
    }

    if (estCritique && !estJournalisee) {
      throw new ValidationError(
        'Toute action critique doit etre journalisee.',
        'POLICY_AUDIT_JOURNALISATION_OBLIGATOIRE',
      );
    }
  }
}
