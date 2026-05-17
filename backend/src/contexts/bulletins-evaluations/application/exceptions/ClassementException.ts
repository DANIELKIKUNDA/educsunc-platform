import { ApplicationException } from './ApplicationException';

// Cette erreur signale un incident applicatif pendant le classement d'une classe.
export class ClassementException extends ApplicationException {
  constructor(message = 'Le classement de la classe a echoue.') {
    super(message, 'BULLETINS_CLASSEMENT_EXCEPTION');
    this.name = 'ClassementException';
  }
}
