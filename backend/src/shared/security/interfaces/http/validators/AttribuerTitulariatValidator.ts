import type { AttribuerTitulariatInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur controle l'attribution d'un titulariat.
export class AttribuerTitulariatValidator {
  public static valider(corps: unknown): AttribuerTitulariatInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      idClasse: ValidationHttpSecurity.lireChaineRequise(donnees, 'idClasse'),
      idAnneeScolaire: ValidationHttpSecurity.lireChaineRequise(donnees, 'idAnneeScolaire'),
      creePar: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'creePar'),
    };
  }
}
