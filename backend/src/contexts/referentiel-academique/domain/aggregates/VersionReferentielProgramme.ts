import { Entite } from '../../../../shared/domain/Entity';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { LigneDiffMigration } from '../entities/LigneDiffMigration';
import { LigneReferentielProgramme } from '../entities/LigneReferentielProgramme';
import { LigneReferentielProgrammeId } from '../value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../value-objects/PonderationEvaluation';
import { SourceReferentiel } from '../value-objects/SourceReferentiel';
import { TypeDiffReferentiel } from '../value-objects/TypeDiffReferentiel';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Cette entite represente une publication officielle appartenant a un referentiel programme parent.
export class VersionReferentielProgramme extends Entite<VersionReferentielProgrammeId> {
  private codeVersion: string;
  private anneeReference: string;
  private datePublication: Date;
  private motifPublication?: string;
  private active: boolean;
  private publiee: boolean;
  private sourceImport: SourceReferentiel;
  private creeLe: Date;
  private lignes: LigneReferentielProgramme[];

  // Ce constructeur initialise une version officielle de referentiel et ses lignes dependantes.
  constructor(
    id: VersionReferentielProgrammeId,
    codeVersion: string,
    anneeReference: string,
    datePublication: Date,
    sourceImport: SourceReferentiel,
    motifPublication?: string,
    active = false,
    creeLe: Date = new Date(),
    lignes: LigneReferentielProgramme[] = [],
    publiee = false,
  ) {
    super(id);

    this.codeVersion = this.validerTexteObligatoire(codeVersion, 'codeVersion');
    this.anneeReference = this.validerTexteObligatoire(anneeReference, 'anneeReference');
    this.datePublication = this.validerDate(datePublication, 'datePublication');
    this.motifPublication = this.validerTexteOptionnel(motifPublication);
    this.active = this.validerBooleen(active, 'active');
    this.publiee = this.validerBooleen(publiee, 'publiee');
    this.sourceImport = this.validerSourceImport(sourceImport);
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.lignes = this.validerLignes(lignes);
    this.verifierCoherencePublication();
  }

  // Cette methode retourne le code de version officiel.
  public obtenirCodeVersion(): string {
    return this.codeVersion;
  }

  // Cette methode retourne l'annee de reference de la version.
  public obtenirAnneeReference(): string {
    return this.anneeReference;
  }

  // Cette methode retourne la date de publication officielle.
  public obtenirDatePublication(): Date {
    return new Date(this.datePublication.getTime());
  }

  // Cette methode retourne le motif de publication si il existe.
  public obtenirMotifPublication(): string | undefined {
    return this.motifPublication;
  }

  // Cette methode indique si la version est active.
  public estActive(): boolean {
    return this.active;
  }

  // Cette methode indique si la version a deja ete publiee officiellement.
  public estPubliee(): boolean {
    return this.publiee;
  }

  // Cette methode retourne la source d'import de la version.
  public obtenirSourceImport(): SourceReferentiel {
    return this.sourceImport;
  }

  // Cette methode retourne la date de creation de la version.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne les lignes officielles portees par cette version.
  public obtenirLignes(): LigneReferentielProgramme[] {
    return [...this.lignes];
  }

  // Cette methode indique si la version peut encore etre editee.
  public estModifiable(): boolean {
    return !this.publiee && !this.active;
  }

  // Cette methode consacre la version comme publication officielle complete.
  public publierVersion(): void {
    if (this.publiee) {
      return;
    }

    this.verifierCoherencePublication();

    if (this.lignes.length === 0) {
      throw new ValidationError(
        'Une version de referentiel publiee doit contenir au moins une ligne officielle.',
        'VERSION_REFERENTIEL_SANS_LIGNE',
      );
    }

    this.publiee = true;
  }

  // Cette methode compare la version courante a une version anterieure.
  public comparerAncienneVersion(ancienneVersion: VersionReferentielProgramme): boolean {
    return this.datePublication.getTime() > ancienneVersion.obtenirDatePublication().getTime();
  }

  // Cette methode produit la liste des differences metier entre deux versions.
  public produireUnDiff(autreVersion: VersionReferentielProgramme): LigneDiffMigration[] {
    const lignesCourantesParCours = new Map<string, LigneReferentielProgramme>();
    const lignesAutresParCours = new Map<string, LigneReferentielProgramme>();
    const differences: LigneDiffMigration[] = [];

    for (const ligne of this.lignes) {
      lignesCourantesParCours.set(ligne.obtenirReferentielCoursId().obtenirValeur(), ligne);
    }

    for (const ligne of autreVersion.obtenirLignes()) {
      lignesAutresParCours.set(ligne.obtenirReferentielCoursId().obtenirValeur(), ligne);
    }

    for (const [codeCours, ligneCourante] of lignesCourantesParCours) {
      const ligneAutre = lignesAutresParCours.get(codeCours);

      if (ligneAutre === undefined) {
        differences.push(
          new LigneDiffMigration(
            TypeDiffReferentiel.COURS_RETIRE,
            codeCours,
            ligneCourante.obtenirPonderation(),
            undefined,
            ligneCourante.obtenirOrdreAffichage(),
          ),
        );
        continue;
      }

      if (ligneCourante.obtenirOrdreAffichage() !== ligneAutre.obtenirOrdreAffichage()) {
        differences.push(
          new LigneDiffMigration(
            TypeDiffReferentiel.ORDRE_MODIFIE,
            codeCours,
            undefined,
            undefined,
            ligneCourante.obtenirOrdreAffichage(),
            ligneAutre.obtenirOrdreAffichage(),
          ),
        );
      }

      if (!ligneCourante.obtenirPonderation().estEgal(ligneAutre.obtenirPonderation())) {
        differences.push(
          new LigneDiffMigration(
            TypeDiffReferentiel.PONDERATION_MODIFIEE,
            codeCours,
            ligneCourante.obtenirPonderation(),
            ligneAutre.obtenirPonderation(),
          ),
        );
      }

      if (ligneCourante.estCalculableDansProgramme() && !ligneAutre.estCalculableDansProgramme()) {
        differences.push(
          new LigneDiffMigration(
            TypeDiffReferentiel.COURS_DEVENU_NON_CALCULABLE,
            codeCours,
            ligneCourante.obtenirPonderation(),
            ligneAutre.obtenirPonderation(),
            ligneCourante.obtenirOrdreAffichage(),
            ligneAutre.obtenirOrdreAffichage(),
          ),
        );
      }
    }

    for (const [codeCours, ligneAutre] of lignesAutresParCours) {
      if (!lignesCourantesParCours.has(codeCours)) {
        differences.push(
          new LigneDiffMigration(
            TypeDiffReferentiel.COURS_AJOUTE,
            codeCours,
            undefined,
            ligneAutre.obtenirPonderation(),
            undefined,
            ligneAutre.obtenirOrdreAffichage(),
          ),
        );
      }
    }

    return differences;
  }

  // Cette methode ajoute une ligne a une version de travail.
  public ajouterLigne(
    ligne: LigneReferentielProgramme,
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    this.verifierVersionModifiable();

    if (!(ligne instanceof LigneReferentielProgramme)) {
      throw new ValidationError(
        'La ligne a ajouter doit etre valide.',
        'VERSION_REFERENTIEL_LIGNE_INVALIDE',
      );
    }

    this.lignes = [...this.lignes, ligne];
    this.verifierCoherenceDesLignes(typeStructureEvaluation);
  }

  // Cette methode modifie une ligne existante sans casser son identite.
  public modifierLigne(
    idLigneReferentielProgramme: LigneReferentielProgrammeId,
    changements: {
      ordreAffichage?: number;
      obligatoire?: boolean;
      aExamen?: boolean;
      estCalculable?: boolean;
      ponderation?: PonderationEvaluation;
      domaine?: string;
      sousDomaine?: string;
    },
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    this.verifierVersionModifiable();
    const ligneExistante = this.trouverLigneOuLever(idLigneReferentielProgramme);

    this.lignes = this.lignes.map((ligne) => {
      if (!ligne.obtenirId().estEgal(idLigneReferentielProgramme)) {
        return ligne;
      }

      return this.reconstruireLigne(ligneExistante, changements);
    });
    this.verifierCoherenceDesLignes(typeStructureEvaluation);
  }

  // Cette methode retire une ligne d'une version de travail.
  public retirerLigne(
    idLigneReferentielProgramme: LigneReferentielProgrammeId,
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    this.verifierVersionModifiable();
    this.trouverLigneOuLever(idLigneReferentielProgramme);

    this.lignes = this.lignes.filter((ligne) =>
      !ligne.obtenirId().estEgal(idLigneReferentielProgramme));
    this.verifierCoherenceDesLignes(typeStructureEvaluation);
  }

  // Cette methode reordonne plusieurs lignes en une seule mutation coherente.
  public reordonnerLignes(
    reordonnancement: Array<{
      idLigne: LigneReferentielProgrammeId;
      ordreAffichage: number;
    }>,
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    this.verifierVersionModifiable();

    if (!Array.isArray(reordonnancement) || reordonnancement.length === 0) {
      throw new ValidationError(
        'Le reordonnancement des lignes doit contenir au moins une ligne cible.',
        'VERSION_REFERENTIEL_REORDONNANCEMENT_INVALIDE',
      );
    }

    const ordresParLigne = new Map<string, number>();

    for (const element of reordonnancement) {
      if (!(element.idLigne instanceof LigneReferentielProgrammeId)) {
        throw new ValidationError(
          'Chaque ligne reordonnee doit avoir un identifiant valide.',
          'VERSION_REFERENTIEL_REORDONNANCEMENT_INVALIDE',
        );
      }

      this.trouverLigneOuLever(element.idLigne);
      ordresParLigne.set(element.idLigne.obtenirValeur(), element.ordreAffichage);
    }

    this.lignes = this.lignes.map((ligne) => {
      const prochainOrdre = ordresParLigne.get(ligne.obtenirId().obtenirValeur());

      if (prochainOrdre === undefined) {
        return ligne;
      }

      return this.reconstruireLigne(ligne, { ordreAffichage: prochainOrdre });
    });
    this.verifierCoherenceDesLignes(typeStructureEvaluation);
  }

  // Cette methode remplace la ponderation d'une ligne de travail.
  public modifierPonderationLigne(
    idLigneReferentielProgramme: LigneReferentielProgrammeId,
    ponderation: PonderationEvaluation,
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    this.modifierLigne(
      idLigneReferentielProgramme,
      { ponderation },
      typeStructureEvaluation,
    );
  }

  // Cette methode verifie les invariants de lignes pour une structure d'evaluation donnee.
  public verifierCoherenceDesLignes(typeStructureEvaluation: TypeStructureEvaluation): void {
    const coursRencontres = new Set<string>();
    const ordresRencontres = new Set<number>();

    for (const ligne of this.lignes) {
      const codeCours = ligne.obtenirReferentielCoursId().obtenirValeur();
      const ordre = ligne.obtenirOrdreAffichage();

      if (coursRencontres.has(codeCours)) {
        throw new ValidationError(
          'Un cours ne peut apparaitre qu une seule fois dans une version de referentiel.',
          'VERSION_REFERENTIEL_COURS_DUPLIQUE',
        );
      }

      if (ordresRencontres.has(ordre)) {
        throw new ValidationError(
          "L'ordre d'affichage doit etre unique a l'interieur d'une version de referentiel.",
          'VERSION_REFERENTIEL_ORDRE_DUPLIQUE',
        );
      }

      coursRencontres.add(codeCours);
      ordresRencontres.add(ordre);
      ligne.verifierCompatibiliteAvecStructure(typeStructureEvaluation);
    }
  }

  private verifierVersionModifiable(): void {
    if (this.active) {
      throw new ValidationError(
        'Cette version est active et ne peut plus etre modifiee.',
        'VERSION_REFERENTIEL_ACTIVE_IMMUTABLE',
      );
    }

    if (this.publiee) {
      throw new ValidationError(
        'Cette version est publiee et ne peut plus etre modifiee.',
        'VERSION_REFERENTIEL_PUBLIEE_IMMUTABLE',
      );
    }
  }

  private trouverLigneOuLever(
    idLigneReferentielProgramme: LigneReferentielProgrammeId,
  ): LigneReferentielProgramme {
    if (!(idLigneReferentielProgramme instanceof LigneReferentielProgrammeId)) {
      throw new ValidationError(
        "L'identifiant de ligne doit etre valide.",
        'VERSION_REFERENTIEL_LIGNE_INVALIDE',
      );
    }

    const ligne = this.lignes.find((ligneCourante) =>
      ligneCourante.obtenirId().estEgal(idLigneReferentielProgramme));

    if (ligne === undefined) {
      throw new ValidationError(
        'La ligne a modifier doit appartenir a la version.',
        'VERSION_REFERENTIEL_LIGNE_INTROUVABLE',
      );
    }

    return ligne;
  }

  private reconstruireLigne(
    ligne: LigneReferentielProgramme,
    changements: {
      ordreAffichage?: number;
      obligatoire?: boolean;
      aExamen?: boolean;
      estCalculable?: boolean;
      ponderation?: PonderationEvaluation;
      domaine?: string;
      sousDomaine?: string;
    },
  ): LigneReferentielProgramme {
    const aExamen = changements.aExamen ?? ligne.aExamenAssocie();

    return new LigneReferentielProgramme(
      ligne.obtenirId(),
      ligne.obtenirReferentielCoursId(),
      changements.ordreAffichage ?? ligne.obtenirOrdreAffichage(),
      changements.obligatoire ?? ligne.estObligatoire(),
      aExamen,
      changements.estCalculable ?? ligne.estCalculableDansProgramme(),
      ligne.obtenirSourceLigne(),
      changements.ponderation ?? ligne.obtenirPonderation(),
      changements.domaine ?? ligne.obtenirDomaine(),
      changements.sousDomaine ?? ligne.obtenirSousDomaine(),
    );
  }

  // Cette methode verifie que les donnees publiees restent completes et coherentes.
  private verifierCoherencePublication(): void {
    if (this.codeVersion.length === 0 || this.anneeReference.length === 0) {
      throw new ValidationError(
        'Une version publiee doit rester complete et coherente.',
        'VERSION_REFERENTIEL_IMMUTABILITE_INVALIDE',
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
        'VERSION_REFERENTIEL_TEXTE_INVALIDE',
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'VERSION_REFERENTIEL_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ValidationError(
        'Une valeur textuelle optionnelle doit etre une chaine de caracteres.',
        'VERSION_REFERENTIEL_TEXTE_OPTIONNEL_INVALIDE',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'VERSION_REFERENTIEL_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'VERSION_REFERENTIEL_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerSourceImport(valeur: SourceReferentiel): SourceReferentiel {
    if (!Object.values(SourceReferentiel).includes(valeur)) {
      throw new ValidationError(
        "La source d'import doit etre valide.",
        'VERSION_REFERENTIEL_SOURCE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerLignes(valeur: LigneReferentielProgramme[]): LigneReferentielProgramme[] {
    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        'Les lignes de version doivent etre fournies sous forme de tableau.',
        'VERSION_REFERENTIEL_LIGNES_INVALIDES',
      );
    }

    for (const ligne of valeur) {
      if (!(ligne instanceof LigneReferentielProgramme)) {
        throw new ValidationError(
          'Chaque ligne de version doit etre une LigneReferentielProgramme valide.',
          'VERSION_REFERENTIEL_LIGNE_INVALIDE',
        );
      }
    }

    return [...valeur];
  }
}
