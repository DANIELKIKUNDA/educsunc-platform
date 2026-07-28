import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import type { OwnershipParentPort } from '../../shared/security/application';

interface EleveAutoriseRow {
  id_eleve: string;
}

export class OwnershipParentAdapter implements OwnershipParentPort {
  private readonly infrastructure = creerInfrastructurePostgresScolariteEleves();

  public async listerElevesAutorises(params: {
    idUtilisateur: string;
    idEcole: string;
  }): Promise<readonly string[]> {
    const resultat = await this.infrastructure.clientLecture.executer<EleveAutoriseRow>(
      `SELECT DISTINCT membre.id_eleve
       FROM familles famille
       JOIN membres_famille membre ON membre.id_famille = famille.id
       WHERE famille.id_ecole = $1
         AND famille.supprime_logiquement = false
         AND EXISTS (
           SELECT 1
           FROM jsonb_array_elements(COALESCE(famille.responsables, '[]'::jsonb)) responsable
           WHERE responsable->>'idUtilisateurAuth' = $2
         )
       ORDER BY membre.id_eleve`,
      [params.idEcole, params.idUtilisateur],
    );

    return resultat.lignes.map((ligne) => ligne.id_eleve);
  }

  public async fermer(): Promise<void> {
    await this.infrastructure.pool.end();
  }
}
