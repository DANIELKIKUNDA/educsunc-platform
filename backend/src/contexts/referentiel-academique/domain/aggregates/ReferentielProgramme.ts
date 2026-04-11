import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { ReferentielProgrammeId } from '../value-objects/ReferentielProgrammeId';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';
import { VersionReferentielProgramme } from './VersionReferentielProgramme';

// Cet agregat represente le referentiel programme racine, proprietaire de ses versions officielles.
export class ReferentielProgramme extends RacineAgregat<ReferentielProgrammeId> {
  private classeAcademiqueId: ClasseAcademiqueId;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private actif: boolean;
  private creeLe: Date;
  private version: number;
  private versionsReferentielProgramme: VersionReferentielProgramme[];

  // Ce constructeur initialise le referentiel racine sans aucune donnee versionnee legacy.
  constructor(
    id: ReferentielProgrammeId,
    classeAcademiqueId: ClasseAcademiqueId,
    typeStructureEvaluation: TypeStructureEvaluation,
    actif = false,
    creeLe: Date = new Date(),
    version = 1,
    versionsReferentielProgramme: VersionReferentielProgramme[] = [],
  ) {
    super(id);

    this.classeAcademiqueId = this.validerClasseAcademiqueId(classeAcademiqueId);
    this.typeStructureEvaluation = this.validerTypeStructureEvaluation(typeStructureEvaluation);
    this.actif = this.validerBooleen(actif, 'actif');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.version = this.validerVersion(version);
    this.versionsReferentielProgramme = this.validerVersionsReferentielProgramme(
      versionsReferentielProgramme,
    );
    this.verifierCoherenceDesVersions();
  }

  // Cette methode retourne la classe academique de rattachement du referentiel.
  public obtenirClasseAcademiqueId(): ClasseAcademiqueId {
    return this.classeAcademiqueId;
  }

  // Cette methode retourne la structure d'evaluation portee par le referentiel.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode indique si le referentiel est actif.
  public estActif(): boolean {
    return this.actif;
  }

  // Cette methode retourne la date de creation du referentiel.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne la version metier courante du referentiel racine.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode retourne toutes les versions officielles portees par le referentiel.
  public obtenirVersionsReferentielProgramme(): VersionReferentielProgramme[] {
    return [...this.versionsReferentielProgramme];
  }

  // Cette methode retourne la version active si elle existe.
  public obtenirVersionActive(): VersionReferentielProgramme | null {
    return this.versionsReferentielProgramme.find((versionReferentielProgramme) =>
      versionReferentielProgramme.estActive()) ?? null;
  }

  // Cette methode retrouve une version par son identifiant metier.
  public trouverVersionParId(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): VersionReferentielProgramme | null {
    return this.versionsReferentielProgramme.find((versionReferentielProgramme) =>
      versionReferentielProgramme.obtenirId().estEgal(idVersionReferentielProgramme)) ?? null;
  }

  // Cette methode retrouve une version par son code officiel.
  public trouverVersionParCode(codeVersion: string): VersionReferentielProgramme | null {
    if (typeof codeVersion !== 'string') {
      throw new ValidationError(
        'Le code de version recherche doit etre une chaine de caracteres.',
        'REFERENTIEL_PROGRAMME_CODE_VERSION_INVALIDE',
      );
    }

    const codeVersionNormalise = codeVersion.trim();

    if (codeVersionNormalise.length === 0) {
      throw new ValidationError(
        'Le code de version recherche est obligatoire.',
        'REFERENTIEL_PROGRAMME_CODE_VERSION_INVALIDE',
      );
    }

    return this.versionsReferentielProgramme.find((versionReferentielProgramme) =>
      versionReferentielProgramme.obtenirCodeVersion() === codeVersionNormalise) ?? null;
  }

  // Cette methode ajoute une version officielle au referentiel racine.
  public ajouterVersion(versionReferentielProgramme: VersionReferentielProgramme): void {
    const versionValidee = this.validerVersionReferentielProgramme(versionReferentielProgramme);

    if (this.trouverVersionParCode(versionValidee.obtenirCodeVersion()) !== null) {
      throw new ValidationError(
        'Deux versions officielles ne peuvent pas porter le meme code dans un meme referentiel.',
        'REFERENTIEL_PROGRAMME_CODE_VERSION_DUPLIQUE',
      );
    }

    if (!versionValidee.estPubliee()) {
      throw new ValidationError(
        'Seule une version publiee peut etre rattachee a un referentiel officiel.',
        'REFERENTIEL_PROGRAMME_VERSION_NON_PUBLIEE',
      );
    }

    versionValidee.verifierCoherenceDesLignes(this.typeStructureEvaluation);

    if (versionValidee.estActive()) {
      this.desactiverToutesLesVersions();
      this.actif = true;
    }

    this.versionsReferentielProgramme = [
      ...this.versionsReferentielProgramme,
      versionValidee,
    ];
    this.incrementerVersionMetier();
  }

  // Cette methode active une version du referentiel et desactive les autres.
  public activerVersion(idVersionReferentielProgramme: VersionReferentielProgrammeId): void {
    const versionCible = this.trouverVersionParId(idVersionReferentielProgramme);

    if (versionCible === null) {
      throw new ValidationError(
        'La version a activer doit appartenir au referentiel.',
        'REFERENTIEL_PROGRAMME_VERSION_INTROUVABLE',
      );
    }

    if (!versionCible.estPubliee()) {
      throw new ValidationError(
        'Une version non publiee ne peut pas etre activee par le referentiel.',
        'REFERENTIEL_PROGRAMME_ACTIVATION_VERSION_NON_PUBLIEE',
      );
    }

    this.versionsReferentielProgramme = this.versionsReferentielProgramme.map(
      (versionReferentielProgramme) => this.reconstruireVersionAvecEtatActivation(
        versionReferentielProgramme,
        versionReferentielProgramme.obtenirId().estEgal(idVersionReferentielProgramme),
      ),
    );
    this.actif = true;
    this.incrementerVersionMetier();
  }

  // Cette methode desactive une version du referentiel sans supprimer son historique.
  public desactiverVersion(idVersionReferentielProgramme: VersionReferentielProgrammeId): void {
    const versionCible = this.trouverVersionParId(idVersionReferentielProgramme);

    if (versionCible === null) {
      throw new ValidationError(
        'La version a desactiver doit appartenir au referentiel.',
        'REFERENTIEL_PROGRAMME_VERSION_INTROUVABLE',
      );
    }

    this.versionsReferentielProgramme = this.versionsReferentielProgramme.map(
      (versionReferentielProgramme) => this.reconstruireVersionAvecEtatActivation(
        versionReferentielProgramme,
        false,
      ),
    );
    this.actif = this.obtenirVersionActive() !== null;
    this.incrementerVersionMetier();
  }

  // Cette methode active le referentiel racine.
  public activer(): void {
    this.actif = true;
    this.incrementerVersionMetier();
  }

  // Cette methode desactive le referentiel racine et toutes ses versions actives.
  public desactiver(): void {
    this.actif = false;
    this.desactiverToutesLesVersions();
    this.incrementerVersionMetier();
  }

  private verifierCoherenceDesVersions(): void {
    const codesVersion = new Set<string>();
    let nombreVersionsActives = 0;

    for (const versionReferentielProgramme of this.versionsReferentielProgramme) {
      const codeVersion = versionReferentielProgramme.obtenirCodeVersion();

      if (codesVersion.has(codeVersion)) {
        throw new ValidationError(
          'Deux versions officielles ne peuvent pas partager le meme code dans un meme referentiel.',
          'REFERENTIEL_PROGRAMME_CODE_VERSION_DUPLIQUE',
        );
      }

      codesVersion.add(codeVersion);
      versionReferentielProgramme.verifierCoherenceDesLignes(this.typeStructureEvaluation);

      if (versionReferentielProgramme.estActive()) {
        nombreVersionsActives += 1;
      }
    }

    if (nombreVersionsActives > 1) {
      throw new ValidationError(
        'Un referentiel ne peut porter qu une seule version active a la fois.',
        'REFERENTIEL_PROGRAMME_PLUSIEURS_VERSIONS_ACTIVES',
      );
    }

    if (this.versionsReferentielProgramme.length > 0 && !this.actif && nombreVersionsActives > 0) {
      this.actif = true;
    }
  }

  private desactiverToutesLesVersions(): void {
    this.versionsReferentielProgramme = this.versionsReferentielProgramme.map(
      (versionReferentielProgramme) => this.reconstruireVersionAvecEtatActivation(
        versionReferentielProgramme,
        false,
      ),
    );
  }

  private reconstruireVersionAvecEtatActivation(
    versionReferentielProgramme: VersionReferentielProgramme,
    active: boolean,
  ): VersionReferentielProgramme {
    return new VersionReferentielProgramme(
      versionReferentielProgramme.obtenirId(),
      versionReferentielProgramme.obtenirCodeVersion(),
      versionReferentielProgramme.obtenirAnneeReference(),
      versionReferentielProgramme.obtenirDatePublication(),
      versionReferentielProgramme.obtenirSourceImport(),
      versionReferentielProgramme.obtenirMotifPublication(),
      active,
      versionReferentielProgramme.obtenirCreeLe(),
      versionReferentielProgramme.obtenirLignes(),
      versionReferentielProgramme.estPubliee(),
    );
  }

  private incrementerVersionMetier(): void {
    this.version += 1;
  }

  private validerClasseAcademiqueId(valeur: ClasseAcademiqueId): ClasseAcademiqueId {
    if (!(valeur instanceof ClasseAcademiqueId)) {
      throw new ValidationError(
        "L'identifiant de classe academique est obligatoire.",
        'REFERENTIEL_PROGRAMME_CLASSE_ACADEMIQUE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTypeStructureEvaluation(
    valeur: TypeStructureEvaluation,
  ): TypeStructureEvaluation {
    if (!Object.values(TypeStructureEvaluation).includes(valeur)) {
      throw new ValidationError(
        "Le type de structure d'evaluation doit etre valide.",
        'REFERENTIEL_PROGRAMME_STRUCTURE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'REFERENTIEL_PROGRAMME_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }
  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'REFERENTIEL_PROGRAMME_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        'La version du referentiel doit etre un entier strictement positif.',
        'REFERENTIEL_PROGRAMME_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersionReferentielProgramme(
    valeur: VersionReferentielProgramme,
  ): VersionReferentielProgramme {
    if (!(valeur instanceof VersionReferentielProgramme)) {
      throw new ValidationError(
        'Chaque version officielle doit etre une VersionReferentielProgramme valide.',
        'REFERENTIEL_PROGRAMME_VERSION_ENFANT_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersionsReferentielProgramme(
    valeur: VersionReferentielProgramme[],
  ): VersionReferentielProgramme[] {
    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        'Les versions du referentiel doivent etre fournies sous forme de tableau.',
        'REFERENTIEL_PROGRAMME_VERSIONS_INVALIDES',
      );
    }

    return valeur.map((versionReferentielProgramme) =>
      this.validerVersionReferentielProgramme(versionReferentielProgramme));
  }
}
