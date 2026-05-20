import { ErreurSecurite } from './ErreurSecurite';

export class ErreurPermissionDupliquee extends ErreurSecurite {
  constructor(message = 'Permission dupliquee') {
    super(message);
    this.name = 'ErreurPermissionDupliquee';
  }
}
