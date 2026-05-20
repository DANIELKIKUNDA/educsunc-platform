import { ErreurContexteActifInvalide } from './ErreurContexteActifInvalide';

// Cette erreur signale qu'une organisation active demandee n'est pas autorisee.
export class ErreurOrganisationActiveInvalide extends ErreurContexteActifInvalide {
  constructor(message = 'Organisation active invalide') {
    super(message);
    this.name = 'ErreurOrganisationActiveInvalide';
  }
}
