import { ErreurAutorisation } from './ErreurAutorisation';

export class ErreurScopeRefuse extends ErreurAutorisation {
  constructor(message = 'Scope refuse') {
    super(message);
    this.name = 'ErreurScopeRefuse';
  }
}
