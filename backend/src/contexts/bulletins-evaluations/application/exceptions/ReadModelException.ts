import { ApplicationException } from './ApplicationException';

// Cette erreur signale une incoherence lors de la construction d'un read model.
export class ReadModelException extends ApplicationException {
  constructor(message = 'Le modele de lecture demande n a pas pu etre construit.') {
    super(message, 'BULLETINS_READ_MODEL_EXCEPTION');
    this.name = 'ReadModelException';
  }
}
