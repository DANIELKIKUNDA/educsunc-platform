import { ApplicationException } from './ApplicationException';

// Cette erreur signale une defaillance lors de la production d'une projection de lecture.
export class ProjectionException extends ApplicationException {
  constructor(message = 'La projection de lecture du bulletin n a pas pu etre produite.') {
    super(message, 'BULLETINS_PROJECTION_EXCEPTION');
    this.name = 'ProjectionException';
  }
}
