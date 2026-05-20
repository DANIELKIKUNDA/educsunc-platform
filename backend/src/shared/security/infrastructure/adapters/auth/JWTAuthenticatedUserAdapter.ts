import type { AuthenticatedUserPort } from '../../../application';
import { EtatCompteUtilisateur, normaliserEtatCompteUtilisateur } from 'shared/auth/domain';

// Cet adaptateur transforme un payload JWT AUTH en utilisateur exploitable par SECURITY.
export class JWTAuthenticatedUserAdapter {
  public extraireDepuisPayload(payload: Record<string, unknown>): AuthenticatedUserPort {
    return {
      idUtilisateur: this.lireChaine(payload.sub ?? payload.idUtilisateur, 'sub'),
      email: this.lireChaine(payload.email, 'email'),
      etatCompte: normaliserEtatCompteUtilisateur(
        this.lireChaine(payload.etatCompte ?? EtatCompteUtilisateur.ACTIVE, 'etatCompte'),
      ),
      roles: this.lireListeTextes(payload.roles),
      permissions: this.lireListeTextes(payload.permissions),
      organisationActiveId: this.lireChaineOptionnelle(payload.organisationActiveId),
      ecoleActiveId: this.lireChaineOptionnelle(payload.ecoleActiveId),
    };
  }

  private lireChaine(valeur: unknown, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ JWT "${nomChamp}" est obligatoire.`);
    }
    return valeur.trim();
  }

  private lireChaineOptionnelle(valeur: unknown): string | undefined {
    if (typeof valeur !== 'string') {
      return undefined;
    }
    const propre = valeur.trim();
    return propre === '' ? undefined : propre;
  }

  private lireListeTextes(valeur: unknown): string[] {
    if (!Array.isArray(valeur)) {
      return [];
    }
    return valeur.filter((element): element is string => typeof element === 'string').map((element) => element.trim()).filter((element) => element !== '');
  }
}
