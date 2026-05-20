import { ErreurSecurite } from './ErreurSecurite';

export class ErreurScopeInvalide extends ErreurSecurite {
  constructor(message = 'Scope invalide') {
    super(message);
    this.name = 'ErreurScopeInvalide';
  }
}
