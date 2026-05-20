import type { CreerRoleInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur transforme la requete HTTP de creation de role en commande applicative fiable.
export class CreerRoleValidator {
  public static valider(corps: unknown): CreerRoleInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      codeRole: ValidationHttpSecurity.lireChaineRequise(donnees, 'codeRole'),
      nomRole: ValidationHttpSecurity.lireChaineRequise(donnees, 'nomRole'),
      description: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'description'),
      niveauAcces: ValidationHttpSecurity.lireChaineRequise(donnees, 'niveauAcces'),
      estSysteme: ValidationHttpSecurity.lireBooleenOptionnel(donnees, 'estSysteme'),
      creePar: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'creePar'),
      permissions: ValidationHttpSecurity.lireTableauChaines(donnees, 'permissions'),
    };
  }
}
