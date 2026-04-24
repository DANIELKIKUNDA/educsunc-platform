export class ConcurrencyService {
  verifierVersion(versionAttendue: number, versionActuelle: number) {
    if (versionAttendue !== versionActuelle) {
      throw new Error('CONFLIT_CONCURRENCE');
    }
  }
}
