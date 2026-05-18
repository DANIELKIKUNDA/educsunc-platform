import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { BlocApplicationConduite } from '../entities/BlocApplicationConduite';
import { DiagnosticTechniqueAcademique } from '../entities/DiagnosticTechniqueAcademique';
import { HistoriqueGenerationBulletin } from '../entities/HistoriqueGenerationBulletin';
import { LigneBulletinEleve } from '../entities/LigneBulletinEleve';
import { SnapshotResultatBulletin } from '../entities/SnapshotResultatBulletin';
import { ValidationBulletinOfficielle } from '../entities/ValidationBulletinOfficielle';
import { BulletinGenere } from '../events/BulletinGenere';
import { BulletinMisAJour } from '../events/BulletinMisAJour';
import { BulletinValideOfficiellement } from '../events/BulletinValideOfficiellement';
import { BulletinVersionFigee } from '../events/BulletinVersionFigee';
import { LigneBulletinEchecMarquee } from '../events/LigneBulletinEchecMarquee';
import { ErreurBulletinFinaliseNonModifiable } from '../exceptions/ErreurBulletinFinaliseNonModifiable';
import { EtatBulletin } from '../value-objects/EtatBulletin';
import { EtatValidationBulletin } from '../value-objects/EtatValidationBulletin';
import { StyleAffichageCote } from '../value-objects/StyleAffichageCote';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cet agregat represente le bulletin progressif et versionne d'un eleve.
export class BulletinEleve extends RacineAgregat<string> {
  private idEcole: string;
  private idEleve: string;
  private idInscriptionScolaire: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private etatBulletin: EtatBulletin;
  private versionBulletin: number;
  private dernierGenereLe?: Date;
  private generePar?: string;
  private versionReferentielProgramme: string;
  private version: number;
  private supprimeLogiquement: boolean;
  private lignesBulletin: LigneBulletinEleve[];
  private blocsApplicationConduite: BlocApplicationConduite[];
  private historiqueGeneration: HistoriqueGenerationBulletin[];
  private validationsOfficielles: ValidationBulletinOfficielle[];
  private snapshotsResultats: SnapshotResultatBulletin[];
  private diagnosticsTechniques: DiagnosticTechniqueAcademique[];

  // Ce constructeur initialise ou reconstitue un bulletin metier.
  constructor(params: {
    idBulletinEleve: string;
    idEcole: string;
    idEleve: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    typeStructureEvaluation: TypeStructureEvaluation;
    etatBulletin?: EtatBulletin;
    versionBulletin?: number;
    dernierGenereLe?: Date;
    generePar?: string;
    versionReferentielProgramme: string;
    version?: number;
    supprimeLogiquement?: boolean;
    lignesBulletin?: LigneBulletinEleve[];
    blocsApplicationConduite?: BlocApplicationConduite[];
    historiqueGeneration?: HistoriqueGenerationBulletin[];
    validationsOfficielles?: ValidationBulletinOfficielle[];
    snapshotsResultats?: SnapshotResultatBulletin[];
    diagnosticsTechniques?: DiagnosticTechniqueAcademique[];
  }) {
    super(params.idBulletinEleve);
    this.idEcole = params.idEcole;
    this.idEleve = params.idEleve;
    this.idInscriptionScolaire = params.idInscriptionScolaire;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.typeStructureEvaluation = params.typeStructureEvaluation;
    this.etatBulletin = params.etatBulletin ?? EtatBulletin.BROUILLON;
    this.versionBulletin = params.versionBulletin ?? 1;
    this.dernierGenereLe = params.dernierGenereLe;
    this.generePar = params.generePar;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
    this.version = params.version ?? 1;
    this.supprimeLogiquement = params.supprimeLogiquement ?? false;
    this.lignesBulletin = [...(params.lignesBulletin ?? [])];
    this.blocsApplicationConduite = [...(params.blocsApplicationConduite ?? [])];
    this.historiqueGeneration = [...(params.historiqueGeneration ?? [])];
    this.validationsOfficielles = [...(params.validationsOfficielles ?? [])];
    this.snapshotsResultats = [...(params.snapshotsResultats ?? [])];
    this.diagnosticsTechniques = [...(params.diagnosticsTechniques ?? [])];
  }

  // Cette methode expose les lignes actuellement porte es par le bulletin.
  public obtenirLignesBulletin(): LigneBulletinEleve[] {
    return [...this.lignesBulletin];
  }

  // Cette methode expose l'identifiant de l'ecole porteuse du bulletin.
  public obtenirIdEcole(): string {
    return this.idEcole;
  }

  // Cette methode expose l'inscription scolaire rattachee.
  public obtenirIdInscriptionScolaire(): string {
    return this.idInscriptionScolaire;
  }

  // Cette methode expose la classe pedagogique rattachee.
  public obtenirIdClassePedagogique(): string {
    return this.idClassePedagogique;
  }

  // Cette methode expose l'annee scolaire rattachee.
  public obtenirIdAnneeScolaire(): string {
    return this.idAnneeScolaire;
  }

  // Cette methode expose les blocs application/conduite.
  public obtenirBlocsApplicationConduite(): BlocApplicationConduite[] {
    return [...this.blocsApplicationConduite];
  }

  // Cette methode expose l'historique des generations du bulletin.
  public obtenirHistoriqueGeneration(): HistoriqueGenerationBulletin[] {
    return [...this.historiqueGeneration];
  }

  // Cette methode expose les validations officielles deja rattachees au bulletin.
  public obtenirValidationsOfficielles(): ValidationBulletinOfficielle[] {
    return [...this.validationsOfficielles];
  }

  // Cette methode expose les snapshots académiques du bulletin.
  public obtenirSnapshotsResultats(): SnapshotResultatBulletin[] {
    return [...this.snapshotsResultats];
  }

  // Cette methode expose les diagnostics techniques lies au bulletin.
  public obtenirDiagnosticsTechniques(): DiagnosticTechniqueAcademique[] {
    return [...this.diagnosticsTechniques];
  }

  // Cette methode expose l'etat de cycle de vie du bulletin.
  public obtenirEtatBulletin(): EtatBulletin {
    return this.etatBulletin;
  }

  // Cette methode expose la version metier du bulletin.
  public obtenirVersionBulletin(): number {
    return this.versionBulletin;
  }

  // Cette methode expose la version du referentiel programme utilisee.
  public obtenirVersionReferentielProgramme(): string {
    return this.versionReferentielProgramme;
  }

  // Cette methode expose la structure d'evaluation du bulletin.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode expose le dernier generateur connu du bulletin.
  public obtenirGenerePar(): string | undefined {
    return this.generePar;
  }

  // Cette methode indique si le bulletin a ete supprime logiquement.
  public obtenirSupprimeLogiquement(): boolean {
    return this.supprimeLogiquement;
  }

  // Cette methode genere ou met a jour la representation metier du bulletin.
  public genererOuMettreAJour(params: {
    lignesBulletin: LigneBulletinEleve[];
    blocsApplicationConduite: BlocApplicationConduite[];
    generePar: string;
    motifGeneration?: string;
  }): void {
    this.verifierModifiable();
    const premiereGeneration = this.lignesBulletin.length === 0;
    this.lignesBulletin = [...params.lignesBulletin].sort((a, b) => a.obtenirOrdreAffichage() - b.obtenirOrdreAffichage());
    this.blocsApplicationConduite = [...params.blocsApplicationConduite];
    this.dernierGenereLe = new Date();
    this.generePar = params.generePar;
    this.etatBulletin = EtatBulletin.GENERE;
    this.version += 1;
    this.ajouterHistoriqueGeneration(new HistoriqueGenerationBulletin({
      idHistoriqueGenerationBulletin: `${this.obtenirId()}-historique-${this.versionBulletin}`,
      dateGeneration: this.dernierGenereLe,
      generePar: params.generePar,
      motifGeneration: params.motifGeneration,
      versionBulletin: this.versionBulletin,
      versionReferentielProgramme: this.versionReferentielProgramme,
    }));

    if (premiereGeneration) {
      this.ajouterEvenement(new BulletinGenere(this.obtenirId(), this.idEleve));
    } else {
      this.ajouterEvenement(new BulletinMisAJour(this.obtenirId()));
    }
  }

  // Cette methode recalcule les styles visuels des lignes d'apres les echecs.
  public marquerLignesEchecEnRouge(): void {
    for (const ligne of this.lignesBulletin) {
      for (const [code, style] of Object.entries(ligne.obtenirStylesColonnes())) {
        if (style === StyleAffichageCote.ECHEC_ROUGE) {
          this.ajouterEvenement(new LigneBulletinEchecMarquee(this.obtenirId(), code));
        }
      }
    }
  }

  // Cette methode fige une version du bulletin pour la rendre historique.
  public figerVersion(): void {
    this.verifierModifiable();
    this.etatBulletin = EtatBulletin.FINALISE;
    this.versionBulletin += 1;
    this.version += 1;
    this.ajouterEvenement(new BulletinVersionFigee(this.obtenirId(), this.versionBulletin));
  }

  // Cette methode ajoute explicitement une entree d'historique.
  public ajouterHistoriqueGeneration(historique: HistoriqueGenerationBulletin): void {
    this.historiqueGeneration.push(historique);
  }

  // Cette methode ajoute un snapshot academique au bulletin.
  public ajouterSnapshot(snapshot: SnapshotResultatBulletin): void {
    this.snapshotsResultats.push(snapshot);
  }

  // Cette methode ajoute un diagnostic academique au bulletin.
  public ajouterDiagnosticTechnique(diagnostic: DiagnosticTechniqueAcademique): void {
    this.diagnosticsTechniques.push(diagnostic);
  }

  // Cette methode enregistre une validation officielle et fige le bulletin si elle est acceptee.
  public ajouterValidationOfficielle(
    validation: ValidationBulletinOfficielle,
  ): void {
    this.validationsOfficielles.push(validation);

    if (validation.obtenirEtatValidation() === EtatValidationBulletin.VALIDEE) {
      this.etatBulletin = EtatBulletin.FINALISE;
      this.version += 1;
      this.ajouterEvenement(
        new BulletinValideOfficiellement(
          this.obtenirId(),
          validation.obtenirVersionBulletin(),
          validation.obtenirValidePar(),
          validation.obtenirRoleValidateur(),
          validation.obtenirDateValidation(),
        ),
      );
    }
  }

  // Cette methode produit une representation simple du bulletin pour l'affichage ou le PDF.
  public produireRepresentationBulletin(): {
    lignes: LigneBulletinEleve[];
    blocs: BlocApplicationConduite[];
    etat: EtatBulletin;
    versionBulletin: number;
  } {
    return {
      lignes: this.obtenirLignesBulletin(),
      blocs: this.obtenirBlocsApplicationConduite(),
      etat: this.etatBulletin,
      versionBulletin: this.versionBulletin,
    };
  }

  // Cette methode bloque les mutations structurelles d'un bulletin finalise.
  private verifierModifiable(): void {
    if (this.etatBulletin === EtatBulletin.FINALISE) {
      throw new ErreurBulletinFinaliseNonModifiable();
    }
  }
}
