import { ApplicationException } from './ApplicationException';

// Cette erreur signale un incident pendant le rejeu des operations offline.
export class SynchronisationOfflineException extends ApplicationException {
  constructor(message = 'La synchronisation offline du bulletin a echoue.') {
    super(message, 'BULLETINS_SYNCHRONISATION_OFFLINE_EXCEPTION');
    this.name = 'SynchronisationOfflineException';
  }
}
