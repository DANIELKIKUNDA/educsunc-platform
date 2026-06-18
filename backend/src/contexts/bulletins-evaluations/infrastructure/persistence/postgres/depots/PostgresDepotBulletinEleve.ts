import { BulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/BulletinEleve';
import type { HistoriqueGenerationBulletin } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueGenerationBulletin';
import { SnapshotResultatBulletin } from 'contexts/bulletins-evaluations/domain/entities/SnapshotResultatBulletin';
import { ValidationBulletinOfficielle } from 'contexts/bulletins-evaluations/domain/entities/ValidationBulletinOfficielle';
import type { DepotBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotBulletinEleve';

// Ce fichier fournit un depot PostgreSQL simplifie pour les bulletins d'eleve.
export class PostgresDepotBulletinEleve implements DepotBulletinEleve {
  private static readonly stockage = new Map<string, BulletinEleve>();
  private static readonly validations = new Map<string, ValidationBulletinOfficielle[]>();
  private static readonly snapshots = new Map<string, SnapshotResultatBulletin[]>();

  public async sauvegarder(bulletinEleve: BulletinEleve): Promise<void> {
    PostgresDepotBulletinEleve.stockage.set(bulletinEleve.obtenirId(), bulletinEleve);
  }

  public async trouverParId(idBulletinEleve: string): Promise<BulletinEleve | null> {
    return PostgresDepotBulletinEleve.stockage.get(idBulletinEleve) ?? null;
  }

  public async trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<BulletinEleve | null> {
    return [...PostgresDepotBulletinEleve.stockage.values()].find((bulletin) =>
      String(Reflect.get(bulletin, 'idEleve') ?? '') === idEleve
      && String(Reflect.get(bulletin, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async trouverVersionActive(
    idEleve: string,
    idInscriptionScolaire: string,
    idAnneeScolaire: string,
  ): Promise<BulletinEleve | null> {
    return [...PostgresDepotBulletinEleve.stockage.values()].find((bulletin) =>
      String(Reflect.get(bulletin, 'idEleve') ?? '') === idEleve
      && String(Reflect.get(bulletin, 'idInscriptionScolaire') ?? '') === idInscriptionScolaire
      && String(Reflect.get(bulletin, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<BulletinEleve[]> {
    return [...PostgresDepotBulletinEleve.stockage.values()].filter((bulletin) =>
      String(Reflect.get(bulletin, 'idClassePedagogique') ?? '') === idClassePedagogique
      && String(Reflect.get(bulletin, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    );
  }

  public async listerHistoriqueGenerations(idBulletinEleve: string): Promise<HistoriqueGenerationBulletin[]> {
    const bulletin = PostgresDepotBulletinEleve.stockage.get(idBulletinEleve);
    return bulletin?.obtenirHistoriqueGeneration() ?? [];
  }

  // Cette methode enregistre une validation officielle rattachee a un bulletin.
  public async ajouterValidationOfficielle(validation: ValidationBulletinOfficielle): Promise<void> {
    const validations = PostgresDepotBulletinEleve.validations.get(validation.obtenirIdBulletinEleve()) ?? [];
    validations.push(validation);
    PostgresDepotBulletinEleve.validations.set(validation.obtenirIdBulletinEleve(), validations);
  }

  // Cette methode relit l'ensemble des validations officielles d'un bulletin.
  public async listerValidations(idBulletinEleve: string): Promise<ValidationBulletinOfficielle[]> {
    return [...(PostgresDepotBulletinEleve.validations.get(idBulletinEleve) ?? [])];
  }

  // Cette methode enregistre un snapshot academique lie a un bulletin.
  public async ajouterSnapshot(snapshot: SnapshotResultatBulletin): Promise<void> {
    const idBulletinEleve = this.retrouverIdBulletinDepuisSnapshot(snapshot);
    const snapshots = PostgresDepotBulletinEleve.snapshots.get(idBulletinEleve) ?? [];
    snapshots.push(snapshot);
    PostgresDepotBulletinEleve.snapshots.set(idBulletinEleve, snapshots);
  }

  // Cette methode relit les snapshots academiques d'un bulletin.
  public async listerSnapshots(idBulletinEleve: string): Promise<SnapshotResultatBulletin[]> {
    return [...(PostgresDepotBulletinEleve.snapshots.get(idBulletinEleve) ?? [])];
  }

  // Cette methode retrouve le bulletin auquel appartient un snapshot academique.
  private retrouverIdBulletinDepuisSnapshot(snapshot: SnapshotResultatBulletin): string {
    const bulletin = [...PostgresDepotBulletinEleve.stockage.values()].find((element) =>
      String(Reflect.get(element, 'idEleve') ?? '') === snapshot.obtenirIdEleve()
      && String(Reflect.get(element, 'idInscriptionScolaire') ?? '') === snapshot.obtenirIdInscriptionScolaire()
      && String(Reflect.get(element, 'idClassePedagogique') ?? '') === snapshot.obtenirIdClassePedagogique()
      && String(Reflect.get(element, 'idAnneeScolaire') ?? '') === snapshot.obtenirIdAnneeScolaire(),
    );

    return bulletin?.obtenirId() ?? snapshot.obtenirIdInscriptionScolaire();
  }
}
