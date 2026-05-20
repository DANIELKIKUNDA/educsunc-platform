import { ErreurSecurite } from './ErreurSecurite';

export class ErreurPermissionInvalide extends ErreurSecurite {
  constructor(message = 'Permission invalide') {
    super(message);
    this.name = 'ErreurPermissionInvalide';
  }
}
