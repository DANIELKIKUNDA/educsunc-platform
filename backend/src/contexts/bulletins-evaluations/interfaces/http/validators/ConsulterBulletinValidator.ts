import type { ConsulterBulletinInput } from '../../../application/dto/input/ConsulterBulletinInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur transporte le contexte de securite requis pour lire un bulletin.
export class ConsulterBulletinValidator {
  public static valider(params: unknown, headers: unknown): ConsulterBulletinInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');

    return {
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idEleve'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }
}
