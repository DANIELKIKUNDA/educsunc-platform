import { ErreurSecurite } from './ErreurSecurite';

export class ErreurRoleInvalide extends ErreurSecurite {
  constructor(message = 'Role invalide') {
    super(message);
    this.name = 'ErreurRoleInvalide';
  }
}
