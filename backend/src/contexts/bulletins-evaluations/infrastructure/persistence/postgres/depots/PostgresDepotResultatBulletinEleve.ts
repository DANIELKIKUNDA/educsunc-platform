import { ResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';

// Ce fichier fournit un depot PostgreSQL simplifie pour les resultats consolides.
export class PostgresDepotResultatBulletinEleve implements DepotResultatBulletinEleve {
  private static readonly stockage = new Map<string, ResultatBulletinEleve>();

  public async sauvegarder(resultatBulletinEleve: ResultatBulletinEleve): Promise<void> {
    PostgresDepotResultatBulletinEleve.stockage.set(resultatBulletinEleve.obtenirId(), resultatBulletinEleve);
  }

  public async trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve | null> {
    return [...PostgresDepotResultatBulletinEleve.stockage.values()].find((resultat) =>
      resultat.obtenirIdEleve() === idEleve && resultat.obtenirIdAnneeScolaire() === idAnneeScolaire,
    ) ?? null;
  }

  public async trouverParEleveInscription(idEleve: string, idInscriptionScolaire: string): Promise<ResultatBulletinEleve | null> {
    return [...PostgresDepotResultatBulletinEleve.stockage.values()].find((resultat) =>
      resultat.obtenirIdEleve() === idEleve && resultat.obtenirIdInscriptionScolaire() === idInscriptionScolaire,
    ) ?? null;
  }

  public async listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<ResultatBulletinEleve[]> {
    return [...PostgresDepotResultatBulletinEleve.stockage.values()].filter((resultat) =>
      resultat.obtenirIdClassePedagogique() === idClassePedagogique
      && resultat.obtenirIdAnneeScolaire() === idAnneeScolaire,
    );
  }

  public async listerNonClassesParClasseEtColonne(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<ResultatBulletinEleve[]> {
    return [...PostgresDepotResultatBulletinEleve.stockage.values()].filter((resultat) =>
      resultat.obtenirIdClassePedagogique() === idClassePedagogique
      && resultat.obtenirIdAnneeScolaire() === idAnneeScolaire
      && resultat.obtenirResultatsColonnes().some((colonne) =>
        String(Reflect.get(colonne, 'codeColonne') ?? '') === codeColonne
        && Boolean(Reflect.get(colonne, 'estNonClasse')),
      ),
    );
  }
}
