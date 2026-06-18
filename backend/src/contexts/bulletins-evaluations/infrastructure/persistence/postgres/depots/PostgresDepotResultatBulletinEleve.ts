import { ResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve';
import { HistoriqueEncodageConduite } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueEncodageConduite';
import { SnapshotResultatBulletin } from 'contexts/bulletins-evaluations/domain/entities/SnapshotResultatBulletin';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import { obtenirMemoireTechniqueBulletins } from './outilsDepotBulletin';

// Ce fichier fournit un depot PostgreSQL simplifie pour les resultats consolides.
export class PostgresDepotResultatBulletinEleve implements DepotResultatBulletinEleve {
  private static readonly stockage = new Map<string, ResultatBulletinEleve>();
  private static readonly historiquesConduite = new Map<string, HistoriqueEncodageConduite[]>();
  private static readonly snapshots = new Map<string, SnapshotResultatBulletin[]>();

  public async sauvegarder(resultatBulletinEleve: ResultatBulletinEleve): Promise<void> {
    PostgresDepotResultatBulletinEleve.stockage.set(resultatBulletinEleve.obtenirId(), resultatBulletinEleve);
  }

  public async trouverParId(idResultatBulletinEleve: string): Promise<ResultatBulletinEleve | null> {
    return PostgresDepotResultatBulletinEleve.stockage.get(idResultatBulletinEleve) ?? null;
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

  public async ajouterHistoriqueEncodageConduite(
    historiqueEncodageConduite: HistoriqueEncodageConduite,
  ): Promise<void> {
    const idResultatBulletinEleve = historiqueEncodageConduite.obtenirIdResultatBulletinEleve();
    const historiques = PostgresDepotResultatBulletinEleve.historiquesConduite.get(idResultatBulletinEleve) ?? [];
    historiques.push(historiqueEncodageConduite);
    PostgresDepotResultatBulletinEleve.historiquesConduite.set(idResultatBulletinEleve, historiques);

    const audits = obtenirMemoireTechniqueBulletins().auditsEncodage.get(idResultatBulletinEleve) ?? [];
    audits.push({
      action: historiqueEncodageConduite.obtenirAnciensPointsConduite() === null ? 'ENCODAGE_CONDUITE' : 'MODIFICATION_CONDUITE',
      dateAction: historiqueEncodageConduite.obtenirDateEncodage(),
      idUtilisateur: historiqueEncodageConduite.obtenirEncodeePar(),
      commentaire: `Periode ${String(historiqueEncodageConduite.obtenirCodePeriode())} : ${historiqueEncodageConduite.obtenirAnciensPointsConduite() ?? 'null'} -> ${historiqueEncodageConduite.obtenirNouveauxPointsConduite()}`,
    });
    obtenirMemoireTechniqueBulletins().auditsEncodage.set(idResultatBulletinEleve, audits);
  }

  public async listerHistoriqueEncodageConduite(idResultatBulletinEleve: string): Promise<HistoriqueEncodageConduite[]> {
    return [...(PostgresDepotResultatBulletinEleve.historiquesConduite.get(idResultatBulletinEleve) ?? [])];
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
