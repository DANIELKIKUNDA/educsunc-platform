import { RelanceurRealtime } from '../../infrastructure';

export class RuntimeRecoveryRealtime {
  constructor(private readonly relanceur = new RelanceurRealtime()) {}

  public relancer() {
    return this.relanceur.relancer();
  }
}
