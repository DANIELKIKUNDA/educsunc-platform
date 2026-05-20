import type { AffectationUtilisateurReadModel, ListerAffectationsUtilisateurQuery } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query liste les affectations actives ou historiques d'un utilisateur.
export class ListerAffectationsUtilisateurSQL implements ListerAffectationsUtilisateurQuery {
  public async executer(idUtilisateur: string): Promise<readonly AffectationUtilisateurReadModel[]> {
    return Array.from(obtenirMemoireSecurityStore().affectations.values())
      .filter((record) => record.id_utilisateur === idUtilisateur)
      .map((record) => ({
        idAffectationUtilisateur: record.id_affectation_utilisateur,
        idUtilisateur: record.id_utilisateur,
        idRole: record.id_role,
        niveauAcces: record.niveau_acces,
        etatAffectation: record.etat_affectation,
      }));
  }
}
