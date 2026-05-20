import { ErreurSecurite } from './ErreurSecurite';

export class ErreurClasseDejaTitulaire extends ErreurSecurite {
  constructor(message = 'La classe possede deja un titulaire actif') {
    super(message);
    this.name = 'ErreurClasseDejaTitulaire';
  }
}
