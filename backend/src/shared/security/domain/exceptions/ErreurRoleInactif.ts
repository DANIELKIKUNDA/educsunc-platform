import { ErreurSecurite } from './ErreurSecurite';

export class ErreurRoleInactif extends ErreurSecurite {
  constructor(message = 'Role inactif') {
    super(message);
    this.name = 'ErreurRoleInactif';
  }
}
