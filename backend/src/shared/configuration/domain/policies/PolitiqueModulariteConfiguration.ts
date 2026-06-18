import { ModuleConfiguration } from '../entities';

// Ce fichier declare la politique de modularite commerciale.

/** Cette classe centralise la coherence plan, modules et features. */
export class PolitiqueModulariteConfiguration {
  /** Cette methode indique si une configuration modulaire est coherentement exploitable. */
  public estCoherente(moduleConfiguration: ModuleConfiguration): boolean {
    const valeur = moduleConfiguration.valeur();
    if (valeur.statutLicence === 'EXPIRED') {
      return valeur.modulesActifs.length === 0;
    }

    return valeur.plan.trim().length > 0;
  }
}
