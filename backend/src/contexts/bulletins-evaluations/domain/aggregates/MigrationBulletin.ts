import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { DiffColonneBulletin } from '../entities/DiffColonneBulletin';
import { TransformationCoteBulletin } from '../entities/TransformationCoteBulletin';
import { MigrationBulletinAnalysee } from '../events/MigrationBulletinAnalysee';
import { MigrationBulletinAnnulee } from '../events/MigrationBulletinAnnulee';
import { MigrationBulletinAppliquee } from '../events/MigrationBulletinAppliquee';
import { TransformationCoteBulletinEnregistree } from '../events/TransformationCoteBulletinEnregistree';
import { ErreurMigrationDejaAppliquee } from '../exceptions/ErreurMigrationDejaAppliquee';
import { PolicyMigrationBulletin } from '../policies/PolicyMigrationBulletin';
import { StatutMigrationBulletin } from '../value-objects/StatutMigrationBulletin';

// Cet agregat trace et pilote les migrations de bulletin entre deux versions de referentiel.
export class MigrationBulletin extends RacineAgregat<string> {
  private idEcole: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private ancienneVersionReferentiel: string;
  private nouvelleVersionReferentiel: string;
  private dateMigration: Date;
  private declenchePar: string;
  private statutMigration: StatutMigrationBulletin;
  private version: number;
  private transformationsCoteBulletin: TransformationCoteBulletin[];
  private diffsColonnesBulletin: DiffColonneBulletin[];

  // Ce constructeur initialise ou reconstitue une migration de bulletin.
  constructor(params: {
    idMigrationBulletin: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    ancienneVersionReferentiel: string;
    nouvelleVersionReferentiel: string;
    dateMigration: Date;
    declenchePar: string;
    statutMigration?: StatutMigrationBulletin;
    version?: number;
    transformationsCoteBulletin?: TransformationCoteBulletin[];
    diffsColonnesBulletin?: DiffColonneBulletin[];
  }) {
    super(params.idMigrationBulletin);
    this.idEcole = params.idEcole;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.ancienneVersionReferentiel = params.ancienneVersionReferentiel;
    this.nouvelleVersionReferentiel = params.nouvelleVersionReferentiel;
    this.dateMigration = params.dateMigration;
    this.declenchePar = params.declenchePar;
    this.statutMigration = params.statutMigration ?? StatutMigrationBulletin.BROUILLON;
    this.version = params.version ?? 1;
    this.transformationsCoteBulletin = [...(params.transformationsCoteBulletin ?? [])];
    this.diffsColonnesBulletin = [...(params.diffsColonnesBulletin ?? [])];
    new PolicyMigrationBulletin().verifier(this.ancienneVersionReferentiel, this.nouvelleVersionReferentiel);
  }

  // Cette methode expose le statut courant de la migration.
  public obtenirStatutMigration(): StatutMigrationBulletin {
    return this.statutMigration;
  }

  // Cette methode expose les transformations de cotes deja journalisees.
  public obtenirTransformationsCoteBulletin(): TransformationCoteBulletin[] {
    return [...this.transformationsCoteBulletin];
  }

  // Cette methode expose les differences detectees.
  public obtenirDiffsColonnesBulletin(): DiffColonneBulletin[] {
    return [...this.diffsColonnesBulletin];
  }

  // Cette methode marque la migration comme analysee apres detection des ecarts.
  public analyser(diffs: DiffColonneBulletin[]): void {
    this.diffsColonnesBulletin = [...diffs];
    this.statutMigration = StatutMigrationBulletin.ANALYSEE;
    this.version += 1;
    this.ajouterEvenement(new MigrationBulletinAnalysee(this.obtenirId()));
  }

  // Cette methode remplace explicitement la liste des differences detectees.
  public detecterDifferences(diffs: DiffColonneBulletin[]): void {
    this.diffsColonnesBulletin = [...diffs];
  }

  // Cette methode enregistre les transformations de cotes produites par la migration.
  public convertirCotes(transformations: TransformationCoteBulletin[]): void {
    this.transformationsCoteBulletin = [...transformations];
    for (const transformation of transformations) {
      this.ajouterEvenement(new TransformationCoteBulletinEnregistree(this.obtenirId(), transformation.obtenirId()));
    }
  }

  // Cette methode applique definitivement la migration.
  public appliquer(): void {
    if (this.statutMigration === StatutMigrationBulletin.APPLIQUEE) {
      throw new ErreurMigrationDejaAppliquee();
    }

    this.statutMigration = StatutMigrationBulletin.APPLIQUEE;
    this.version += 1;
    this.ajouterEvenement(new MigrationBulletinAppliquee(this.obtenirId()));
  }

  // Cette methode cloture la migration par annulation explicite.
  public cloturer(): void {
    if (this.statutMigration === StatutMigrationBulletin.APPLIQUEE) {
      throw new ErreurMigrationDejaAppliquee('Une migration deja appliquee ne peut plus etre annulee.');
    }

    this.statutMigration = StatutMigrationBulletin.ANNULEE;
    this.version += 1;
    this.ajouterEvenement(new MigrationBulletinAnnulee(this.obtenirId()));
  }

  // Cette methode ajoute une transformation supplementaire a l'historique.
  public journaliserTransformation(transformation: TransformationCoteBulletin): void {
    this.transformationsCoteBulletin.push(transformation);
    this.ajouterEvenement(new TransformationCoteBulletinEnregistree(this.obtenirId(), transformation.obtenirId()));
  }
}
