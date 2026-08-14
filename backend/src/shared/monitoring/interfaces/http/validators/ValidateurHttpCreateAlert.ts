import type { DtoHttpCreateAlert } from '../dto/inputs';
import { MonitoringValidationException } from '../../../application';
import { objetRequis, nombreRequis, texteRequis } from './_validation-support';
import { ValidateurHttpContexteMonitoring } from './ValidateurHttpContexteMonitoring';

export class ValidateurHttpCreateAlert {
  public static valider(entree: unknown): DtoHttpCreateAlert {
    const objet = objetRequis(entree, 'alerte');
    const warning = nombreRequis(objet, 'warning');
    const critical = nombreRequis(objet, 'critical');
    if (critical < warning) throw new MonitoringValidationException('Le seuil critical ne peut pas etre inferieur au seuil warning.');
    return {
      alertId: texteRequis(objet, 'alertId', 160),
      indicateur: texteRequis(objet, 'indicateur', 160),
      warning,
      critical,
      unite: texteRequis(objet, 'unite', 32),
      valeurObservee: nombreRequis(objet, 'valeurObservee'),
      message: texteRequis(objet, 'message', 1000),
      contexte: ValidateurHttpContexteMonitoring.valider(objet.contexte),
      correlationId: texteRequis(objet, 'correlationId', 128),
    };
  }
}
