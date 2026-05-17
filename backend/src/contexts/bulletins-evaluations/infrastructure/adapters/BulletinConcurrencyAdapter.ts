import type { ConcurrencyPort } from 'contexts/bulletins-evaluations/application/ports/out/ConcurrencyPort';
import { ConcurrencyService } from 'shared/infrastructure/concurrency/ConcurrencyService';

// Ce fichier adapte le service transverse de controle de version au BC bulletins.
export class BulletinConcurrencyAdapter implements ConcurrencyPort {
  // Ce constructeur accepte le service shared afin d'eviter une logique locale dupliquee.
  constructor(private readonly concurrence = new ConcurrencyService()) {}

  // Cette methode compare la version attendue a la version courante et leve un conflit si besoin.
  public verifierVersion(versionAttendue: number, versionActuelle: number): void {
    this.concurrence.verifierVersion(versionAttendue, versionActuelle);
  }
}
