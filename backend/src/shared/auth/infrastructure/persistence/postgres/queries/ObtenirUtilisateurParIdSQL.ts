import { UtilisateurAuthReadModel } from '../../../../application';
import { PostgresUtilisateurAuthRepository } from '../repositories/PostgresUtilisateurAuthRepository';

// Cette query fournit une lecture optimisee d'utilisateur AUTH par identifiant.
export class ObtenirUtilisateurParIdSQL {
  constructor(private readonly repository: PostgresUtilisateurAuthRepository) {}

  public async executer(idUtilisateur: string): Promise<UtilisateurAuthReadModel | null> {
    const utilisateur = await this.repository.trouverParId(idUtilisateur);
    if (!utilisateur) {
      return null;
    }

    return {
      idUtilisateur: utilisateur.obtenirId(),
      nomComplet: utilisateur.obtenirNomComplet(),
      email: utilisateur.obtenirEmail().obtenirValeur(),
      etatCompte: utilisateur.obtenirEtatCompte(),
      dernierAccesLe: utilisateur.obtenirDernierAccesLe()?.toISOString(),
    };
  }
}
