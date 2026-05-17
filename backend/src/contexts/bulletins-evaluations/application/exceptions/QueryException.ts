import { ApplicationException } from './ApplicationException';

// Cette erreur signale un incident de lecture optimisee au niveau application.
export class QueryException extends ApplicationException {
  constructor(message = 'La requete de lecture du bulletin a echoue.') {
    super(message, 'BULLETINS_QUERY_EXCEPTION');
    this.name = 'QueryException';
  }
}
