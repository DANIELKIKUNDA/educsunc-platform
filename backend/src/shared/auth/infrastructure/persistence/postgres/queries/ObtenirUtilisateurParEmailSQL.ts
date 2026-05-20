import { ObtenirUtilisateurParEmailQuery } from '../../../../application';
import { UtilisateurAuthReadModel } from '../../../../application';
import { PostgresUtilisateurAuthRepository } from '../repositories/PostgresUtilisateurAuthRepository';

// Cette query fournit une lecture optimisee d'utilisateur AUTH par email.
export class ObtenirUtilisateurParEmailSQL implements ObtenirUtilisateurParEmailQuery {
  constructor(private readonly repository: PostgresUtilisateurAuthRepository) {}

  public async executer(email: string): Promise<UtilisateurAuthReadModel | null> {
    const utilisateur = await this.repository.trouverParEmail(email);
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
