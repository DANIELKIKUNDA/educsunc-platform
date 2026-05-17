import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ApplicationPeriode } from '../entities/ApplicationPeriode';
import { ConduitePeriode } from '../entities/ConduitePeriode';
import { DiagnosticEchec } from '../entities/DiagnosticEchec';
import { ResultatColonneBulletin } from '../entities/ResultatColonneBulletin';
import { FicheCotationEleveCours } from './FicheCotationEleveCours';
import { ApplicationPeriodeCalculee } from '../events/ApplicationPeriodeCalculee';
import { ConduitePeriodeEncodee } from '../events/ConduitePeriodeEncodee';
import { DiagnosticEchecMisAJour } from '../events/DiagnosticEchecMisAJour';
import { EleveMarqueNonClasse } from '../events/EleveMarqueNonClasse';
import { ResultatBulletinRecalcule } from '../events/ResultatBulletinRecalcule';
import { ErreurResultatBulletinIncoherent } from '../exceptions/ErreurResultatBulletinIncoherent';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cet agregat porte les resultats consolides d'un eleve pour son inscription courante.
export class ResultatBulletinEleve extends RacineAgregat<string> {
  private idEcole: string;
  private idEleve: string;
  private idInscriptionScolaire: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private estNonClassePourColonne: Partial<Record<CodeColonneBulletin, boolean>>;
  private versionReferentielProgramme: string;
  private dernierRecalculLe?: Date;
  private version: number;
  private supprimeLogiquement: boolean;
  private resultatsColonnes: ResultatColonneBulletin[];
  private applicationsPeriodes: ApplicationPeriode[];
  private conduitesPeriodes: ConduitePeriode[];
  private diagnosticsEchec: DiagnosticEchec[];

  // Ce constructeur reconstitue ou initialise un resultat consolide.
  constructor(params: {
    idResultatBulletinEleve: string;
    idEcole: string;
    idEleve: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    typeStructureEvaluation: TypeStructureEvaluation;
    estNonClassePourColonne?: Partial<Record<CodeColonneBulletin, boolean>>;
    versionReferentielProgramme: string;
    dernierRecalculLe?: Date;
    version?: number;
    supprimeLogiquement?: boolean;
    resultatsColonnes?: ResultatColonneBulletin[];
    applicationsPeriodes?: ApplicationPeriode[];
    conduitesPeriodes?: ConduitePeriode[];
    diagnosticsEchec?: DiagnosticEchec[];
  }) {
    super(params.idResultatBulletinEleve);
    this.idEcole = params.idEcole;
    this.idEleve = params.idEleve;
    this.idInscriptionScolaire = params.idInscriptionScolaire;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.typeStructureEvaluation = params.typeStructureEvaluation;
    this.estNonClassePourColonne = { ...(params.estNonClassePourColonne ?? {}) };
    this.versionReferentielProgramme = params.versionReferentielProgramme;
    this.dernierRecalculLe = params.dernierRecalculLe;
    this.version = params.version ?? 1;
    this.supprimeLogiquement = params.supprimeLogiquement ?? false;
    this.resultatsColonnes = [...(params.resultatsColonnes ?? [])];
    this.applicationsPeriodes = [...(params.applicationsPeriodes ?? [])];
    this.conduitesPeriodes = [...(params.conduitesPeriodes ?? [])];
    this.diagnosticsEchec = [...(params.diagnosticsEchec ?? [])];
  }

  // Cette methode expose l'identifiant de l'eleve.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose l'inscription rattachee.
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

  // Cette methode expose la structure d'evaluation.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode expose les resultats consolides par colonne.
  public obtenirResultatsColonnes(): ResultatColonneBulletin[] {
    return [...this.resultatsColonnes];
  }

  // Cette methode expose les blocs d'application.
  public obtenirApplicationsPeriodes(): ApplicationPeriode[] {
    return [...this.applicationsPeriodes];
  }

  // Cette methode expose les conduites par periode.
  public obtenirConduitesPeriodes(): ConduitePeriode[] {
    return [...this.conduitesPeriodes];
  }

  // Cette methode expose les diagnostics pedagogiques calcules.
  public obtenirDiagnosticsEchec(): DiagnosticEchec[] {
    return [...this.diagnosticsEchec];
  }

  // Cette methode recalcule l'ensemble des resultats a partir des fiches de cotation.
  public recalculerDepuisFiches(fiches: FicheCotationEleveCours[]): void {
    const colonnes = this.resultatsColonnes.map((resultatColonne) => resultatColonne.obtenirCodeColonne());
    for (const codeColonne of colonnes) {
      this.recalculerResultatColonne(codeColonne, fiches);
    }

    this.dernierRecalculLe = new Date();
    this.version += 1;
    this.ajouterEvenement(new ResultatBulletinRecalcule(this.obtenirId(), this.idEleve));
  }

  // Cette methode calcule le total entier pour une colonne donnee.
  public calculerTotalColonne(codeColonne: CodeColonneBulletin, fiches: FicheCotationEleveCours[]): number {
    return fiches
      .filter((fiche) => fiche.obtenirEstCalculable())
      .reduce((somme, fiche) => somme + (fiche.obtenirCoteParColonne(codeColonne)?.obtenirCoteObtenue() ?? 0), 0);
  }

  // Cette methode calcule le maximum general pour une colonne donnee.
  public calculerMaximumColonne(codeColonne: CodeColonneBulletin, fiches: FicheCotationEleveCours[]): number {
    return fiches
      .filter((fiche) => fiche.obtenirEstCalculable())
      .reduce((somme, fiche) => somme + (fiche.obtenirCoteParColonne(codeColonne)?.obtenirMaximumColonne() ?? 0), 0);
  }

  // Cette methode marque explicitement un eleve non classe pour une colonne.
  public marquerNonClasse(codeColonne: CodeColonneBulletin): void {
    this.estNonClassePourColonne[codeColonne] = true;
    this.recupererResultatObligatoire(codeColonne).marquerNonClasse();
    this.version += 1;
    this.ajouterEvenement(new EleveMarqueNonClasse(this.obtenirId(), codeColonne));
  }

  // Cette methode applique un rang officiel recu du classement de classe.
  public appliquerRang(codeColonne: CodeColonneBulletin, rang: number): void {
    this.recupererResultatObligatoire(codeColonne).appliquerRang(rang);
  }

  // Cette methode met a jour l'application affichee pour une periode simple.
  public mettreAJourApplication(codePeriode: CodePeriodeSimple, pourcentage: number): void {
    const applicationExistante = this.applicationsPeriodes.find((application) => application.obtenirCodePeriode() === codePeriode);
    if (applicationExistante) {
      applicationExistante.mettreAJourPourcentage(pourcentage);
    } else {
      this.applicationsPeriodes.push(new ApplicationPeriode({
        idApplicationPeriode: `${this.obtenirId()}-${codePeriode}-application`,
        codePeriode,
        pourcentage,
      }));
    }

    this.ajouterEvenement(new ApplicationPeriodeCalculee(this.obtenirId(), codePeriode));
  }

  // Cette methode met a jour la conduite pour une periode simple.
  public mettreAJourConduite(codePeriode: CodePeriodeSimple, pointsConduite: number, encodeePar?: string): void {
    const conduiteExistante = this.conduitesPeriodes.find((conduite) => conduite.obtenirCodePeriode() === codePeriode);
    if (conduiteExistante) {
      conduiteExistante.encoder(pointsConduite, encodeePar);
    } else {
      this.conduitesPeriodes.push(new ConduitePeriode({
        idConduitePeriode: `${this.obtenirId()}-${codePeriode}-conduite`,
        codePeriode,
        pointsConduite,
        encodeePar,
        dateEncodage: new Date(),
      }));
    }

    this.ajouterEvenement(new ConduitePeriodeEncodee(this.obtenirId(), codePeriode));
  }

  // Cette methode met a jour le diagnostic d'echec d'une colonne.
  public mettreAJourDiagnosticEchec(diagnostic: DiagnosticEchec): void {
    const index = this.diagnosticsEchec.findIndex(
      (diagnosticCourant) => diagnosticCourant.obtenirCodeColonne() === diagnostic.obtenirCodeColonne(),
    );

    if (index >= 0) {
      this.diagnosticsEchec[index] = diagnostic;
    } else {
      this.diagnosticsEchec.push(diagnostic);
    }

    this.ajouterEvenement(new DiagnosticEchecMisAJour(this.obtenirId(), diagnostic.obtenirCodeColonne()));
  }

  // Cette methode recalcule proprement une seule colonne a partir des fiches.
  private recalculerResultatColonne(codeColonne: CodeColonneBulletin, fiches: FicheCotationEleveCours[]): void {
    const resultat = this.recupererResultatObligatoire(codeColonne);
    const coteManquante = fiches
      .filter((fiche) => fiche.obtenirEstCalculable())
      .some((fiche) => fiche.obtenirCoteParColonne(codeColonne)?.obtenirCoteObtenue() === null);

    if (coteManquante) {
      this.marquerNonClasse(codeColonne);
      return;
    }

    const total = this.calculerTotalColonne(codeColonne, fiches);
    const maximum = this.calculerMaximumColonne(codeColonne, fiches);
    resultat.mettreAJourCalcul(total, maximum, true);
    this.estNonClassePourColonne[codeColonne] = false;
  }

  // Cette methode retrouve une colonne consolidee et echoue proprement si elle est absente.
  private recupererResultatObligatoire(codeColonne: CodeColonneBulletin): ResultatColonneBulletin {
    const resultat = this.resultatsColonnes.find((element) => element.obtenirCodeColonne() === codeColonne);
    if (!resultat) {
      throw new ErreurResultatBulletinIncoherent('Le resultat de colonne demande est absent.');
    }

    return resultat;
  }
}
