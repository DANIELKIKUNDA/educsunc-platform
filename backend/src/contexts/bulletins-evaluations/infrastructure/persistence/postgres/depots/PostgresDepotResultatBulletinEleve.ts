import { ResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve';
import { SnapshotResultatBulletin } from 'contexts/bulletins-evaluations/domain/entities/SnapshotResultatBulletin';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';

// Ce fichier fournit un depot PostgreSQL simplifie pour les resultats consolides.
export class PostgresDepotResultatBulletinEleve implements DepotResultatBulletinEleve {
  private static readonly stockage = new Map<string, ResultatBulletinEleve>();
  private static readonly snapshots = new Map<string, SnapshotResultatBulletin[]>();

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

  // Cette methode ajoute un snapshot de resultat pour un eleve.
  public async ajouterSnapshotResultat(snapshot: SnapshotResultatBulletin): Promise<void> {
    const idResultatBulletinEleve = this.retrouverIdResultatDepuisSnapshot(snapshot);
    const snapshots = PostgresDepotResultatBulletinEleve.snapshots.get(idResultatBulletinEleve) ?? [];
    snapshots.push(snapshot);
    PostgresDepotResultatBulletinEleve.snapshots.set(idResultatBulletinEleve, snapshots);
  }

  // Cette methode relit tous les snapshots lies a un resultat consolide.
  public async listerSnapshotsResultats(idResultatBulletinEleve: string): Promise<SnapshotResultatBulletin[]> {
    return [...(PostgresDepotResultatBulletinEleve.snapshots.get(idResultatBulletinEleve) ?? [])];
  }

  // Cette methode retrouve le resultat consolide auquel un snapshot est rattache.
  private retrouverIdResultatDepuisSnapshot(snapshot: SnapshotResultatBulletin): string {
    const resultat = [...PostgresDepotResultatBulletinEleve.stockage.values()].find((element) =>
      element.obtenirIdEleve() === snapshot.obtenirIdEleve()
      && element.obtenirIdInscriptionScolaire() === snapshot.obtenirIdInscriptionScolaire()
      && element.obtenirIdClassePedagogique() === snapshot.obtenirIdClassePedagogique()
      && element.obtenirIdAnneeScolaire() === snapshot.obtenirIdAnneeScolaire(),
    );

    return resultat?.obtenirId() ?? snapshot.obtenirIdInscriptionScolaire();
  }
}
