import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { Ecole } from '../aggregates/Ecole';
import { ModeExploitation } from '../value-objects/ModeExploitation';

// Cette policy porte les regles globales du fonctionnement offline-first du referentiel academique.
export class PolicyOffline {
  // Cette methode impose que toute ecriture soit d'abord locale avant une eventualite de synchronisation.
  public verifierEcritureLocalePrioritaire(
    ecole: Ecole,
    ecritureLocaleEffectuee: boolean,
  ): void {
    if (!ecritureLocaleEffectuee) {
      throw new ValidationError(
        `Le mode ${ecole.obtenirModeExploitation()} impose une ecriture locale prioritaire.`,
        'POLICY_OFFLINE_ECRITURE_LOCALE_OBLIGATOIRE',
      );
    }
  }

  // Cette methode impose que la synchronisation reste differee et ne remplace jamais l'ecriture locale initiale.
  public verifierSynchronisationDifferee(
    ecole: Ecole,
    synchronisationImmediateDemandee: boolean,
    ecritureLocaleEffectuee: boolean,
  ): void {
    const modeExploitation = ecole.obtenirModeExploitation();

    if (
      modeExploitation === ModeExploitation.OFFLINE_ONLY
      && synchronisationImmediateDemandee
    ) {
      throw new ValidationError(
        'Le mode OFFLINE_ONLY interdit toute synchronisation immediate.',
        'POLICY_OFFLINE_SYNCHRONISATION_INTERDITE',
      );
    }

    if (synchronisationImmediateDemandee && !ecritureLocaleEffectuee) {
      throw new ValidationError(
        'La synchronisation doit rester differee tant que l ecriture locale n a pas ete enregistree.',
        'POLICY_OFFLINE_SYNCHRONISATION_PREMATUREE',
      );
    }
  }
}
