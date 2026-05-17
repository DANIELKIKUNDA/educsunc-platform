import type { SynchroniserOperationOfflineInput } from 'contexts/bulletins-evaluations/application/dto/input/SynchroniserOperationOfflineInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle les commandes HTTP de synchronisation offline.
export class SynchronisationOfflineValidator {
  // Cette methode valide la charge utile d'une operation offline a rejouer.
  public static valider(corps: unknown): SynchroniserOperationOfflineInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idOperationOffline: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idOperationOffline'),
      typeOperation: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'typeOperation'),
      payload: ValidationHttpBulletinsEvaluations.lireValeur(donnees, 'payload'),
      cleIdempotence: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'cleIdempotence'),
    };
  }
}
