import { ErreurAutorisation } from './ErreurAutorisation';

export class ErreurSectionNonAutorisee extends ErreurAutorisation {
  constructor(message = 'Section non autorisee') {
    super(message);
    this.name = 'ErreurSectionNonAutorisee';
  }
}
