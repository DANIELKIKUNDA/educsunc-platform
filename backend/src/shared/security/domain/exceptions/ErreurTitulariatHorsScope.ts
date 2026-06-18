import { ErreurSecurite } from './ErreurSecurite';

export class ErreurTitulariatHorsScope extends ErreurSecurite {
  constructor(message = 'Le titulariat doit rester coherent avec le scope organisation/ecole de l affectation enseignante.') {
    super(message);
    this.name = 'ErreurTitulariatHorsScope';
  }
}
