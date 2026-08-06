import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import type { SqlQueryClient } from '../../shared/infrastructure/persistence/SqlQueryClient';
import type { OwnershipParentPort } from '../../shared/security/application';

interface EleveAutoriseRow {
  id_eleve: string;
}

export class OwnershipParentAdapter implements OwnershipParentPort {
  private readonly infrastructure?: ReturnType<typeof creerInfrastructurePostgresScolariteEleves>;
  private readonly clientLecture: SqlQueryClient;

  constructor(clientLecture?: SqlQueryClient) {
    this.infrastructure = clientLecture
      ? undefined
      : creerInfrastructurePostgresScolariteEleves();
    this.clientLecture = clientLecture ?? this.infrastructure!.clientLecture;
  }

  public async listerElevesAutorises(params: {
    idUtilisateur: string;
    idEcole: string;
  }): Promise<readonly string[]> {
    const resultat = await this.clientLecture.executer<EleveAutoriseRow>(
      `SELECT DISTINCT eleve.id AS id_eleve
       FROM familles famille
       JOIN eleves eleve ON eleve.id_famille = famille.id
       WHERE famille.id_ecole = $1
         AND famille.supprime_logiquement = false
         AND eleve.supprime_logiquement = false
         AND EXISTS (
           SELECT 1
           FROM jsonb_array_elements(COALESCE(famille.responsables, '[]'::jsonb)) responsable
           WHERE responsable->>'idUtilisateurAuth' = $2
         )
       ORDER BY eleve.id`,
      [params.idEcole, params.idUtilisateur],
    );

    return resultat.lignes.map((ligne) => ligne.id_eleve);
  }

  public async fermer(): Promise<void> {
    await this.infrastructure?.pool.end();
  }
}
