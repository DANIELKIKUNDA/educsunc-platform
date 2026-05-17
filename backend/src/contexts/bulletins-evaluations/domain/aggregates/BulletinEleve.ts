import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { BlocApplicationConduite } from '../entities/BlocApplicationConduite';
import { HistoriqueGenerationBulletin } from '../entities/HistoriqueGenerationBulletin';
import { LigneBulletinEleve } from '../entities/LigneBulletinEleve';
import { BulletinGenere } from '../events/BulletinGenere';
import { BulletinMisAJour } from '../events/BulletinMisAJour';
import { BulletinVersionFigee } from '../events/BulletinVersionFigee';
import { LigneBulletinEchecMarquee } from '../events/LigneBulletinEchecMarquee';
import { ErreurBulletinFinaliseNonModifiable } from '../exceptions/ErreurBulletinFinaliseNonModifiable';
import { EtatBulletin } from '../value-objects/EtatBulletin';
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
  }

  // Cette methode expose les lignes actuellement porte es par le bulletin.
  public obtenirLignesBulletin(): LigneBulletinEleve[] {
    return [...this.lignesBulletin];
  }

  // Cette methode expose les blocs application/conduite.
  public obtenirBlocsApplicationConduite(): BlocApplicationConduite[] {
    return [...this.blocsApplicationConduite];
  }

  // Cette methode expose l'historique des generations du bulletin.
  public obtenirHistoriqueGeneration(): HistoriqueGenerationBulletin[] {
    return [...this.historiqueGeneration];
  }

  // Cette methode expose l'etat de cycle de vie du bulletin.
  public obtenirEtatBulletin(): EtatBulletin {
    return this.etatBulletin;
  }

  // Cette methode expose la version metier du bulletin.
  public obtenirVersionBulletin(): number {
    return this.versionBulletin;
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
