import type { DiagnosticEchecQuery } from 'contexts/bulletins-evaluations/application/queries/DiagnosticEchecQuery';
import type { DiagnosticEchecReadModel } from 'contexts/bulletins-evaluations/application/read-models/DiagnosticEchecReadModel';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';
import { ResultatBulletinPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale des diagnostics d'echec d'un eleve.
export class PostgresDiagnosticEchecQuery implements DiagnosticEchecQuery {
  private readonly depot = new PostgresDepotResultatBulletinEleve();

  // Cette methode relit les diagnostics deja consolides dans le resultat de l'eleve.
  public async executer(idEleve: string, idAnneeScolaire: string): Promise<DiagnosticEchecReadModel[]> {
    const resultat = await this.depot.trouverParEleveEtAnnee(idEleve, idAnneeScolaire);
    return resultat?.obtenirDiagnosticsEchec().map((diagnostic) => ResultatBulletinPostgresMapper.versDiagnostic(diagnostic)) ?? [];
  }
}
