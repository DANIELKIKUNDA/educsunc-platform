import type { ConsulterHistoriqueBulletinInput } from '../../../application/dto/input/ConsulterHistoriqueBulletinInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur transporte le contexte de securite requis pour relire l'historique d'un bulletin.
export class ConsulterHistoriqueBulletinValidator {
  public static valider(params: unknown, headers: unknown): ConsulterHistoriqueBulletinInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');

    return {
      idBulletinEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idBulletinEleve'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }
}
