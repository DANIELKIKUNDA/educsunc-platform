import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../value-objects/ClassePedagogiqueId';
import { EcoleId } from '../value-objects/EcoleId';
import { OrganisationId } from '../value-objects/OrganisationId';
import { ResponsabiliteClassePedagogiqueId } from '../value-objects/ResponsabiliteClassePedagogiqueId';
import { SectionScolaireId } from '../value-objects/SectionScolaireId';

// Cette interface decrit l'etat metier persistable d'une responsabilite de classe.
export interface ProprietesResponsabiliteClassePedagogique {
  id: ResponsabiliteClassePedagogiqueId;
  idOrganisation: OrganisationId;
  idEcole: EcoleId;
  idClassePedagogique: ClassePedagogiqueId;
  idClasseAcademique: ClasseAcademiqueId;
  idSectionScolaire: SectionScolaireId;
  idAnneeScolaire: AnneeScolaireId;
  idUtilisateurEnseignant: string;
  active: boolean;
  dateDebut: Date;
  dateFin?: Date;
  creeLe: Date;
  creePar?: string;
  version: number;
}

// Cet agregat represente la responsabilite officielle d'un enseignant sur une classe pedagogique.
export class ResponsabiliteClassePedagogique extends RacineAgregat<ResponsabiliteClassePedagogiqueId> {
  private idOrganisation: OrganisationId;
  private idEcole: EcoleId;
  private idClassePedagogique: ClassePedagogiqueId;
  private idClasseAcademique: ClasseAcademiqueId;
  private idSectionScolaire: SectionScolaireId;
  private idAnneeScolaire: AnneeScolaireId;
  private idUtilisateurEnseignant: string;
  private active: boolean;
  private dateDebut: Date;
  private dateFin?: Date;
  private creeLe: Date;
  private creePar?: string;
  private version: number;

  constructor(proprietes: ProprietesResponsabiliteClassePedagogique) {
    super(proprietes.id);

    this.idOrganisation = this.validerOrganisationId(proprietes.idOrganisation);
    this.idEcole = this.validerEcoleId(proprietes.idEcole);
    this.idClassePedagogique = this.validerClassePedagogiqueId(proprietes.idClassePedagogique);
    this.idClasseAcademique = this.validerClasseAcademiqueId(proprietes.idClasseAcademique);
    this.idSectionScolaire = this.validerSectionScolaireId(proprietes.idSectionScolaire);
    this.idAnneeScolaire = this.validerAnneeScolaireId(proprietes.idAnneeScolaire);
    this.idUtilisateurEnseignant = this.validerTexteObligatoire(
      proprietes.idUtilisateurEnseignant,
      'idUtilisateurEnseignant',
    );
    this.active = this.validerBooleen(proprietes.active, 'active');
    this.dateDebut = this.validerDate(proprietes.dateDebut, 'dateDebut');
    this.dateFin = this.validerDateOptionnelle(proprietes.dateFin, 'dateFin');
    this.creeLe = this.validerDate(proprietes.creeLe, 'creeLe');
    this.creePar = this.validerTexteOptionnel(proprietes.creePar);
    this.version = this.validerVersion(proprietes.version);
    this.verifierEtatArchivage();
  }

  public obtenirIdOrganisation(): OrganisationId {
    return this.idOrganisation;
  }

  public obtenirIdEcole(): EcoleId {
    return this.idEcole;
  }

  public obtenirIdClassePedagogique(): ClassePedagogiqueId {
    return this.idClassePedagogique;
  }

  public obtenirIdClasseAcademique(): ClasseAcademiqueId {
    return this.idClasseAcademique;
  }

  public obtenirIdSectionScolaire(): SectionScolaireId {
    return this.idSectionScolaire;
  }

  public obtenirIdAnneeScolaire(): AnneeScolaireId {
    return this.idAnneeScolaire;
  }

  public obtenirIdUtilisateurEnseignant(): string {
    return this.idUtilisateurEnseignant;
  }

  public estActive(): boolean {
    return this.active;
  }

  public obtenirDateDebut(): Date {
    return new Date(this.dateDebut.getTime());
  }

  public obtenirDateFin(): Date | undefined {
    return this.dateFin === undefined ? undefined : new Date(this.dateFin.getTime());
  }

  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  public obtenirCreePar(): string | undefined {
    return this.creePar;
  }

  public obtenirVersion(): number {
    return this.version;
  }

  public desactiver(dateFin = new Date()): void {
    if (!this.active) {
      throw new ValidationError(
        'La responsabilite de classe pedagogique est deja inactive.',
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_DEJA_INACTIVE',
      );
    }

    this.active = false;
    this.dateFin = this.validerDate(dateFin, 'dateFin');
    this.version += 1;
  }

  public correspondAClasseEtAnnee(
    idClassePedagogique: ClassePedagogiqueId,
    idAnneeScolaire: AnneeScolaireId,
  ): boolean {
    return this.idClassePedagogique.estEgal(idClassePedagogique)
      && this.idAnneeScolaire.estEgal(idAnneeScolaire);
  }

  private verifierEtatArchivage(): void {
    if (this.active && this.dateFin !== undefined) {
      throw new ValidationError(
        'Une responsabilite active ne peut pas deja porter de date de fin.',
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_ETAT_INCOHERENT',
      );
    }
  }

  private validerOrganisationId(valeur: OrganisationId): OrganisationId {
    if (!(valeur instanceof OrganisationId)) {
      throw new ValidationError(
        "L'identifiant d'organisation est obligatoire.",
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_ORGANISATION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerEcoleId(valeur: EcoleId): EcoleId {
    if (!(valeur instanceof EcoleId)) {
      throw new ValidationError(
        "L'identifiant d'ecole est obligatoire.",
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_ECOLE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerClassePedagogiqueId(valeur: ClassePedagogiqueId): ClassePedagogiqueId {
    if (!(valeur instanceof ClassePedagogiqueId)) {
      throw new ValidationError(
        "L'identifiant de classe pedagogique est obligatoire.",
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_CLASSE_PEDAGOGIQUE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerClasseAcademiqueId(valeur: ClasseAcademiqueId): ClasseAcademiqueId {
    if (!(valeur instanceof ClasseAcademiqueId)) {
      throw new ValidationError(
        "L'identifiant de classe academique est obligatoire.",
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_CLASSE_ACADEMIQUE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerSectionScolaireId(valeur: SectionScolaireId): SectionScolaireId {
    if (!(valeur instanceof SectionScolaireId)) {
      throw new ValidationError(
        "L'identifiant de section scolaire est obligatoire.",
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_SECTION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerAnneeScolaireId(valeur: AnneeScolaireId): AnneeScolaireId {
    if (!(valeur instanceof AnneeScolaireId)) {
      throw new ValidationError(
        "L'identifiant d'annee scolaire est obligatoire.",
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_ANNEE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }

  private validerDateOptionnelle(valeur: Date | undefined, nomChamp: string): Date | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    return this.validerDate(valeur, nomChamp);
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        'La version de la responsabilite doit etre un entier strictement positif.',
        'RESPONSABILITE_CLASSE_PEDAGOGIQUE_VERSION_INVALIDE',
      );
    }

    return valeur;
  }
}
