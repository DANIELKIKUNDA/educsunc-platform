import { ApplicationException } from './ApplicationException';

// Cette erreur signale un incident applicatif lors d'une migration de bulletin.
export class MigrationBulletinException extends ApplicationException {
  constructor(message = 'La migration de bulletin a echoue.') {
    super(message, 'BULLETINS_MIGRATION_EXCEPTION');
    this.name = 'MigrationBulletinException';
  }
}
