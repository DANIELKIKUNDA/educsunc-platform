import type { TitulariatMiddleware } from 'shared/security/infrastructure';

// Ce guard compose le middleware de titulariat dans le pipeline HTTP SECURITY.
export class TitulariatGuard {
  constructor(private readonly titulariatMiddleware: TitulariatMiddleware) {}

  public async verifier(idClasse: string, idAnneeScolaire: string): Promise<void> {
    await this.titulariatMiddleware.verifier(idClasse, idAnneeScolaire);
  }
}
