import type { ChangerOrganisationActiveInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare le changement d'organisation active.
export class ChangerOrganisationActiveValidator {
  public static valider(corps: unknown): ChangerOrganisationActiveInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      idOrganisationActive: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idOrganisationActive'),
    };
  }
}
