import type { AffectationUtilisateurReadModel } from '../read-models';
export interface ListerAffectationsUtilisateurQuery {
  executer(idUtilisateur: string): Promise<readonly AffectationUtilisateurReadModel[]>;
}
