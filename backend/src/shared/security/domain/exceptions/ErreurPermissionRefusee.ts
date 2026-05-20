import { ErreurAutorisation } from './ErreurAutorisation';

export class ErreurPermissionRefusee extends ErreurAutorisation {
  constructor(message = 'Permission refusee') {
    super(message);
    this.name = 'ErreurPermissionRefusee';
  }
}
