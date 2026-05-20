import { ErreurAutorisation } from './ErreurAutorisation';

export class ErreurOrganisationNonAutorisee extends ErreurAutorisation {
  constructor(message = 'Organisation non autorisee') {
    super(message);
    this.name = 'ErreurOrganisationNonAutorisee';
  }
}
