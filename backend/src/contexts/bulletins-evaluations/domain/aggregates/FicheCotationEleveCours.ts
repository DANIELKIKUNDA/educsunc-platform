import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { CoteColonneBulletin } from '../entities/CoteColonneBulletin';
import { ConflitEncodageCoteDetecte } from '../events/ConflitEncodageCoteDetecte';
import { CoteEncodee } from '../events/CoteEncodee';
import { CoteModifiee } from '../events/CoteModifiee';
import { CoteVidee } from '../events/CoteVidee';
import { EchecCoteDetecte } from '../events/EchecCoteDetecte';
import { FicheCotationCreee } from '../events/FicheCotationCreee';
import { TotalColonneRecalcule } from '../events/TotalColonneRecalcule';
import { ErreurFicheCotationIncoherente } from '../exceptions/ErreurFicheCotationIncoherente';
import { PolicyColonneInterdite } from '../policies/PolicyColonneInterdite';
import { PolicyColonneTotalCalculee } from '../policies/PolicyColonneTotalCalculee';
import { PolicyCoursSansExamen } from '../policies/PolicyCoursSansExamen';
import { CodeColonneBulletin, estColonneTotalBulletin } from '../value-objects/CodeColonneBulletin';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cet agregat porte toutes les cotes finales d'un eleve pour un cours dans une annee donnee.
export class FicheCotationEleveCours extends RacineAgregat<string> {
  private idEcole: string;
  private idEleve: string;
  private idInscriptionScolaire: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private idReferentielCours: string;
  private idProgrammeNiveau: string;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private estCalculable: boolean;
  private aExamen: boolean;
  private versionReferentielProgramme: string;
  private creePar: string;
  private creeLe: Date;
  private modifiePar?: string;
  private modifieLe?: Date;
  private version: number;
  private supprimeLogiquement: boolean;
  private cotesColonnes: CoteColonneBulletin[];

  // Ce constructeur reconstitue ou cree une fiche complete de cotation.
  constructor(params: {
    idFicheCotationEleveCours: string;
    idEcole: string;
    idEleve: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    idReferentielCours: string;
    idProgrammeNiveau: string;
    typeStructureEvaluation: TypeStructureEvaluation;
    estCalculable: boolean;
    aExamen: boolean;
    versionReferentielProgramme: string;
    creePar: string;
    creeLe: Date;
    modifiePar?: string;
    modifieLe?: Date;
    version?: number;
    supprimeLogiquement?: boolean;
    cotesColonnes?: CoteColonneBulletin[];
    creerEvenement?: boolean;
  }) {
    super(params.idFicheCotationEleveCours);
    this.idEcole = params.idEcole;
    this.idEleve = params.idEleve;
    this.idInscriptionScolaire = params.idInscriptionScolaire;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.idReferentielCours = params.idReferentielCours;
    this.idProgrammeNiveau = params.idProgrammeNiveau;
    this.typeStructureEvaluation = params.typeStructureEvaluation;
    this.estCalculable = params.estCalculable;
    this.aExamen = params.aExamen;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
    this.creePar = params.creePar;
    this.creeLe = params.creeLe;
    this.modifiePar = params.modifiePar;
    this.modifieLe = params.modifieLe;
    this.version = params.version ?? 1;
    this.supprimeLogiquement = params.supprimeLogiquement ?? false;
    this.cotesColonnes = [...(params.cotesColonnes ?? [])];
    this.verifierCoherence();

    if (params.creerEvenement ?? true) {
      this.ajouterEvenement(new FicheCotationCreee(this.obtenirId(), this.idEcole, this.idEleve));
    }
  }

  // Cette methode expose l'identifiant de l'ecole.
  public obtenirIdEcole(): string {
    return this.idEcole;
  }

  // Cette methode expose l'identifiant de l'eleve.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose l'inscription scolaire rattachee.
  public obtenirIdInscriptionScolaire(): string {
    return this.idInscriptionScolaire;
  }

  // Cette methode expose la classe pedagogique rattachee.
  public obtenirIdClassePedagogique(): string {
    return this.idClassePedagogique;
  }

  // Cette methode expose l'annee scolaire de la fiche.
  public obtenirIdAnneeScolaire(): string {
    return this.idAnneeScolaire;
  }

  // Cette methode expose le cours de reference.
  public obtenirIdReferentielCours(): string {
    return this.idReferentielCours;
  }

  // Cette methode expose le programme-niveau de reference.
  public obtenirIdProgrammeNiveau(): string {
    return this.idProgrammeNiveau;
  }

  // Cette methode expose la structure d'evaluation.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode indique si le cours reste calculable.
  public obtenirEstCalculable(): boolean {
    return this.estCalculable;
  }

  // Cette methode indique si le cours comporte une colonne examen.
  public obtenirAExamen(): boolean {
    return this.aExamen;
  }

  // Cette methode expose la version du programme de reference.
  public obtenirVersionReferentielProgramme(): string {
    return this.versionReferentielProgramme;
  }

  // Cette methode expose l'auteur de creation de la fiche.
  public obtenirCreePar(): string {
    return this.creePar;
  }

  // Cette methode expose la date de creation de la fiche.
  public obtenirCreeLe(): Date {
    return this.creeLe;
  }

  // Cette methode expose le dernier auteur de modification lorsqu'il existe.
  public obtenirModifiePar(): string | undefined {
    return this.modifiePar;
  }

  // Cette methode expose la date de derniere modification lorsqu'elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe;
  }

  // Cette methode expose la version de concurrence de la fiche.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode indique si la fiche a ete supprimee logiquement.
  public obtenirSupprimeLogiquement(): boolean {
    return this.supprimeLogiquement;
  }

  // Cette methode expose la collection complete des cotes de colonne.
  public obtenirCotesColonnes(): CoteColonneBulletin[] {
    return [...this.cotesColonnes];
  }

  // Cette methode retrouve une colonne precise par son code.
  public obtenirCoteParColonne(codeColonne: CodeColonneBulletin): CoteColonneBulletin | undefined {
    return this.cotesColonnes.find((coteColonne) => coteColonne.obtenirCodeColonne() === codeColonne);
  }

  // Cette methode encode une nouvelle cote manuelle sur une colonne autorisee.
  public encoderCote(codeColonne: CodeColonneBulletin, valeur: number, auteur: string, versionAttendue?: number): void {
    this.verifierVersion(versionAttendue);
    this.verifierColonneAutorisee(codeColonne);
    this.verifierExamenAutorise(codeColonne);
    const cote = this.recupererColonneObligatoire(codeColonne);
    cote.encoder(valeur, auteur);
    this.modifiePar = auteur;
    this.modifieLe = new Date();
    this.incrementerVersion();
    this.ajouterEvenement(new CoteEncodee(this.obtenirId(), codeColonne));
    this.marquerEchecSiNecessaire(codeColonne);
  }

  // Cette methode modifie une cote deja existante.
  public modifierCote(codeColonne: CodeColonneBulletin, valeur: number, auteur: string, versionAttendue?: number): void {
    this.verifierVersion(versionAttendue);
    this.verifierColonneAutorisee(codeColonne);
    this.verifierExamenAutorise(codeColonne);
    const cote = this.recupererColonneObligatoire(codeColonne);
    cote.modifier(valeur, auteur);
    this.modifiePar = auteur;
    this.modifieLe = new Date();
    this.incrementerVersion();
    this.ajouterEvenement(new CoteModifiee(this.obtenirId(), codeColonne));
    this.marquerEchecSiNecessaire(codeColonne);
  }

  // Cette methode vide une cote lorsqu'elle doit devenir absente.
  public viderCote(codeColonne: CodeColonneBulletin, auteur: string, versionAttendue?: number): void {
    this.verifierVersion(versionAttendue);
    this.verifierColonneAutorisee(codeColonne);
    this.verifierExamenAutorise(codeColonne);
    this.recupererColonneObligatoire(codeColonne).vider();
    this.modifiePar = auteur;
    this.modifieLe = new Date();
    this.incrementerVersion();
    this.ajouterEvenement(new CoteVidee(this.obtenirId(), codeColonne));
  }

  // Cette methode recalcule les colonnes total conformement a la structure officielle.
  public calculerColonnesTotal(): void {
    const groupes = this.typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL
      ? [
          { cible: CodeColonneBulletin.TOTAL_S1, sources: [CodeColonneBulletin.P1, CodeColonneBulletin.P2, CodeColonneBulletin.EX1] },
          { cible: CodeColonneBulletin.TOTAL_S2, sources: [CodeColonneBulletin.P3, CodeColonneBulletin.P4, CodeColonneBulletin.EX2] },
          { cible: CodeColonneBulletin.TOTAL_GENERAL, sources: [CodeColonneBulletin.TOTAL_S1, CodeColonneBulletin.TOTAL_S2] },
        ]
      : [
          { cible: CodeColonneBulletin.TOTAL_T1, sources: [CodeColonneBulletin.P1, CodeColonneBulletin.P2, CodeColonneBulletin.EX1] },
          { cible: CodeColonneBulletin.TOTAL_T2, sources: [CodeColonneBulletin.P3, CodeColonneBulletin.P4, CodeColonneBulletin.EX2] },
          { cible: CodeColonneBulletin.TOTAL_T3, sources: [CodeColonneBulletin.P5, CodeColonneBulletin.P6, CodeColonneBulletin.EX3] },
          { cible: CodeColonneBulletin.TOTAL_GENERAL, sources: [CodeColonneBulletin.TOTAL_T1, CodeColonneBulletin.TOTAL_T2, CodeColonneBulletin.TOTAL_T3] },
        ];

    for (const groupe of groupes) {
      const colonneTotal = this.obtenirCoteParColonne(groupe.cible);
      if (!colonneTotal) {
        continue;
      }

      const valeurs = groupe.sources
        .map((codeColonne) => this.obtenirCoteParColonne(codeColonne))
        .filter((coteColonne): coteColonne is CoteColonneBulletin => coteColonne !== undefined)
        .map((coteColonne) => coteColonne.obtenirCoteObtenue());

      const total = valeurs.every((valeur) => valeur === null)
        ? null
        : valeurs.reduce<number>((somme, valeur) => somme + (valeur ?? 0), 0);

      colonneTotal.appliquerValeurCalculee(total);
      this.ajouterEvenement(new TotalColonneRecalcule(this.obtenirId(), groupe.cible));
      this.marquerEchecSiNecessaire(groupe.cible);
    }
  }

  // Cette methode interdit les colonnes absentes de la structure effective de la fiche.
  public verifierColonneAutorisee(codeColonne: CodeColonneBulletin): void {
    const estAutorisee = this.obtenirCoteParColonne(codeColonne) !== undefined;
    new PolicyColonneInterdite().verifier(estAutorisee);
    if (!estColonneTotalBulletin(codeColonne)) {
      new PolicyColonneTotalCalculee().verifier(codeColonne);
    }
  }

  // Cette methode s'assure qu'aucun examen n'est saisi sur un cours sans examen.
  public verifierExamenAutorise(codeColonne: CodeColonneBulletin): void {
    new PolicyCoursSansExamen().verifier(codeColonne, this.aExamen);
  }

  // Cette methode detecte et historise un echec sur une colonne.
  public marquerEchecSiNecessaire(codeColonne: CodeColonneBulletin): void {
    const cote = this.recupererColonneObligatoire(codeColonne);
    cote.recalculerEchec();
    if (cote.obtenirEstEchec()) {
      this.ajouterEvenement(new EchecCoteDetecte(this.obtenirId(), codeColonne));
    }
  }

  // Cette methode signale explicitement un conflit de version sur la fiche.
  public signalerConflitEncodage(): void {
    this.ajouterEvenement(new ConflitEncodageCoteDetecte(this.obtenirId()));
  }

  // Cette methode protege l'etat minimal d'une fiche de cotation.
  private verifierCoherence(): void {
    if (this.cotesColonnes.length === 0) {
      throw new ErreurFicheCotationIncoherente('Une fiche de cotation doit porter au moins une colonne.');
    }

    if (new Set(this.cotesColonnes.map((coteColonne) => coteColonne.obtenirCodeColonne())).size !== this.cotesColonnes.length) {
      throw new ErreurFicheCotationIncoherente('Une colonne ne peut apparaitre qu une seule fois dans une fiche.');
    }
  }

  // Cette methode retrouve une colonne et echoue proprement si elle n'existe pas.
  private recupererColonneObligatoire(codeColonne: CodeColonneBulletin): CoteColonneBulletin {
    const cote = this.obtenirCoteParColonne(codeColonne);
    if (!cote) {
      throw new ErreurFicheCotationIncoherente('La colonne demandee est absente de la fiche.');
    }

    return cote;
  }

  // Cette methode verifie la version attendue lorsqu'un appel sensible la fournit.
  private verifierVersion(versionAttendue?: number): void {
    if (versionAttendue === undefined) {
      return;
    }

    if (versionAttendue !== this.version) {
      this.signalerConflitEncodage();
      throw new ErreurFicheCotationIncoherente('La version de la fiche a evolue avant la modification.');
    }
  }

  // Cette methode incremente la version de concurrence de l'agregat.
  private incrementerVersion(): void {
    this.version += 1;
  }
}
