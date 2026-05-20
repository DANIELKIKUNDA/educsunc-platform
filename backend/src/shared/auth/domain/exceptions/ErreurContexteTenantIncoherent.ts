import { ErreurContexteActifInvalide } from './ErreurContexteActifInvalide';

// Cette erreur signale qu'une ecole active n'appartient pas a l'organisation active.
export class ErreurContexteTenantIncoherent extends ErreurContexteActifInvalide {
  constructor(message = 'Contexte tenant incoherent') {
    super(message);
    this.name = 'ErreurContexteTenantIncoherent';
  }
}
