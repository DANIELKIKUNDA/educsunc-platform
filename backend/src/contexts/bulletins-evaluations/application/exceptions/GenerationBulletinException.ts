import { ApplicationException } from './ApplicationException';

// Cette erreur signale un probleme applicatif lors de la generation d'un bulletin.
export class GenerationBulletinException extends ApplicationException {
  constructor(message = 'La generation du bulletin a echoue.') {
    super(message, 'BULLETINS_GENERATION_EXCEPTION');
    this.name = 'GenerationBulletinException';
  }
}
