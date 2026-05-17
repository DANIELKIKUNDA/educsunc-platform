// Ce port abstrait la verification technique de version pour la concurrence optimiste.
export interface ConcurrencyPort {
  verifierVersion(versionAttendue: number, versionActuelle: number): void;
}
