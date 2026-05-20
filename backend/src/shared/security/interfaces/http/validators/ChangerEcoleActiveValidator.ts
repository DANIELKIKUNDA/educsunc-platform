import type { ChangerEcoleActiveInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare le changement d'ecole active.
export class ChangerEcoleActiveValidator {
  public static valider(corps: unknown): ChangerEcoleActiveInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      idEcoleActive: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idEcoleActive'),
    };
  }
}
