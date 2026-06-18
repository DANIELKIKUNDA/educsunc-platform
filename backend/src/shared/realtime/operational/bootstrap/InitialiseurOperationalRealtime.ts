import { FabriqueOperationalRealtime } from './FabriqueOperationalRealtime';

export class InitialiseurOperationalRealtime {
  constructor(private readonly fabrique = new FabriqueOperationalRealtime()) {}

  public initialiser() {
    return this.fabrique.creer();
  }
}
