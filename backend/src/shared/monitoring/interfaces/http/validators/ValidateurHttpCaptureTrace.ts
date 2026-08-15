import { TYPES_TRACE } from '../../../domain';
import type { DtoHttpCaptureTrace } from '../dto/inputs';
import { booleenRequis, nombreRequis, objetRequis, texteOptionnel, texteRequis, valeurEnumRequise } from './_validation-support';
import { ValidateurHttpContexteMonitoring } from './ValidateurHttpContexteMonitoring';

export class ValidateurHttpCaptureTrace {
  public static valider(entree: unknown): DtoHttpCaptureTrace {
    const objet = objetRequis(entree, 'trace');
    return {
      traceId: texteRequis(objet, 'traceId', 160),
      type: valeurEnumRequise(objet, 'type', TYPES_TRACE),
      operation: texteRequis(objet, 'operation', 255),
      succes: booleenRequis(objet, 'succes'),
      dureeMillisecondes: nombreRequis(objet, 'dureeMillisecondes', 0),
      message: texteOptionnel(objet, 'message', 2000),
      contexte: ValidateurHttpContexteMonitoring.valider(objet.contexte),
      correlationId: texteRequis(objet, 'correlationId', 128),
    };
  }
}
