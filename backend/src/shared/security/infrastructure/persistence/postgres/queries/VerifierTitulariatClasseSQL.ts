import type { VerifierTitulariatClasseQuery } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query verifie l'existence d'un titulariat actif sur une classe pour une annee.
export class VerifierTitulariatClasseSQL implements VerifierTitulariatClasseQuery {
  public async executer(idClasse: string, idAnneeScolaire: string): Promise<boolean> {
    return Array.from(obtenirMemoireSecurityStore().titulariats.values()).some((record) =>
      record.id_classe === idClasse &&
      record.id_annee_scolaire === idAnneeScolaire &&
      record.est_actif,
    );
  }
}
