import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { AffectationClasseDesactivee } from '../events/AffectationClasseDesactivee';
import { ClasseAffectationChangee } from '../events/ClasseAffectationChangee';
import { EleveAffecteAClasse } from '../events/EleveAffecteAClasse';
import { ErreurAffectationInexistante } from '../exceptions/ErreurAffectationInexistante';
import { ErreurClasseEtInscriptionIncoherentes } from '../exceptions/ErreurClasseEtInscriptionIncoherentes';
import { Instant, LocalDate, UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier porte l'agregat AffectationClasse, lien annuel actif entre une inscription et une classe.
export interface ProprietesAffectationClasse {
  idAffectationClasse: UUID;
  idOrganisation: UUID;
  idEcole: UUID;
  idInscriptionScolaire: UUID;
  idClassePedagogique: UUID;
  dateAffectation: LocalDate;
  motifAffectation?: string;
  active: boolean;
  creePar: UUID;
  creeLe: Instant;
  modifiePar?: UUID;
  modifieLe?: Instant;
  version: number;
  supprimeLogiquement: boolean;
}

/**
 * Cet agregat represente l'affectation d'une inscription validee dans une classe pedagogique.
 */
export class AffectationClasse extends RacineAgregat<UUID> {
  private idOrganisation: UUID;
  private idEcole: UUID;
  private idInscriptionScolaire: UUID;
  private idClassePedagogique: UUID;
  private dateAffectation: LocalDate;
  private motifAffectation?: string;
  private active: boolean;
  private creePar: UUID;
  private creeLe: Instant;
  private modifiePar?: UUID;
  private modifieLe?: Instant;
  private version: number;
  private supprimeLogiquement: boolean;

  // Ce constructeur reconstitue une affectation de classe depuis son etat metier.
  constructor(proprietes: ProprietesAffectationClasse) {
    super(AffectationClasse.nettoyerTexteObligatoire(proprietes.idAffectationClasse, 'idAffectationClasse'));
    this.idOrganisation = AffectationClasse.nettoyerTexteObligatoire(proprietes.idOrganisation, 'idOrganisation');
    this.idEcole = AffectationClasse.nettoyerTexteObligatoire(proprietes.idEcole, 'idEcole');
    this.idInscriptionScolaire = AffectationClasse.nettoyerTexteObligatoire(proprietes.idInscriptionScolaire, 'idInscriptionScolaire');
    this.idClassePedagogique = AffectationClasse.nettoyerTexteObligatoire(proprietes.idClassePedagogique, 'idClassePedagogique');
    this.dateAffectation = AffectationClasse.validerDateLocale(proprietes.dateAffectation, 'dateAffectation');
    this.motifAffectation = AffectationClasse.nettoyerTexteOptionnel(proprietes.motifAffectation);
    this.active = proprietes.active;
    this.creePar = AffectationClasse.nettoyerTexteObligatoire(proprietes.creePar, 'creePar');
    this.creeLe = AffectationClasse.validerInstant(proprietes.creeLe, 'creeLe');
    this.modifiePar = AffectationClasse.nettoyerTexteOptionnel(proprietes.modifiePar);
    this.modifieLe = AffectationClasse.validerInstantOptionnel(proprietes.modifieLe, 'modifieLe');
    this.version = AffectationClasse.validerVersion(proprietes.version);
    this.supprimeLogiquement = proprietes.supprimeLogiquement;
  }

  /** Cree une affectation active pour une inscription scolaire. */
  public static creer(proprietes: Omit<ProprietesAffectationClasse, 'active' | 'creeLe' | 'version' | 'supprimeLogiquement'> & { creeLe?: Instant }): AffectationClasse {
    const affectation = new AffectationClasse({
      ...proprietes,
      active: true,
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
      supprimeLogiquement: false,
    });

    affectation.ajouterEvenement(new EleveAffecteAClasse(affectation.idOrganisation, affectation.idEcole, affectation.creePar, affectation.obtenirId()));

    return affectation;
  }

  /** Desactive l'affectation courante sans la supprimer. */
  public desactiver(modifiePar: UUID): void {
    if (!this.active) {
      throw new ErreurAffectationInexistante('Cette affectation n est deja plus active.');
    }

    this.active = false;
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new AffectationClasseDesactivee(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Change la classe de l'affectation active en conservant la trace du changement. */
  public changerClasse(idNouvelleClassePedagogique: UUID, motifAffectation: string | undefined, modifiePar: UUID): void {
    if (!this.active) {
      throw new ErreurAffectationInexistante('Une affectation inactive ne peut pas changer de classe.');
    }

    this.idClassePedagogique = AffectationClasse.nettoyerTexteObligatoire(idNouvelleClassePedagogique, 'idNouvelleClassePedagogique');
    this.motifAffectation = AffectationClasse.nettoyerTexteOptionnel(motifAffectation);
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new ClasseAffectationChangee(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Verifie que l'inscription et la classe appartiennent au meme contexte scolaire. */
  public verifierCoherenceInscriptionEtClasse(idEcoleInscription: UUID, idAnneeScolaireInscription: UUID, idEcoleClasse: UUID, idAnneeScolaireClasse: UUID): void {
    if (this.idEcole !== idEcoleInscription || this.idEcole !== idEcoleClasse || idAnneeScolaireInscription !== idAnneeScolaireClasse) {
      throw new ErreurClasseEtInscriptionIncoherentes('La classe pedagogique doit appartenir a la meme ecole et a la meme annee scolaire que l inscription.');
    }
  }

  /** Verifie que la version attendue correspond a la version courante. */
  public verifierConcurrence(versionAttendue: number): void {
    if (this.version !== versionAttendue) {
      throw new ErreurClasseEtInscriptionIncoherentes(`La version attendue ${versionAttendue} ne correspond pas a la version courante ${this.version}.`);
    }
  }

  /** Retourne l'organisation proprietaire de l'affectation. */
  public obtenirIdOrganisation(): UUID { return this.idOrganisation; }
  /** Retourne l'ecole de l'affectation. */
  public obtenirIdEcole(): UUID { return this.idEcole; }
  /** Retourne l'inscription affectee. */
  public obtenirIdInscriptionScolaire(): UUID { return this.idInscriptionScolaire; }
  /** Retourne la classe pedagogique active ou historique. */
  public obtenirIdClassePedagogique(): UUID { return this.idClassePedagogique; }
  /** Retourne la date d'affectation. */
  public obtenirDateAffectation(): LocalDate { return this.dateAffectation; }
  /** Retourne le motif d'affectation quand il existe. */
  public obtenirMotifAffectation(): string | undefined { return this.motifAffectation; }
  /** Indique si l'affectation est actuellement active. */
  public estActive(): boolean { return this.active && !this.supprimeLogiquement; }
  /** Retourne la version courante de l'affectation. */
  public obtenirVersion(): number { return this.version; }

  /** Retourne toutes les proprietes metier pour les mappers futurs. */
  public versProprietes(): ProprietesAffectationClasse {
    return {
      idAffectationClasse: this.obtenirId(),
      idOrganisation: this.idOrganisation,
      idEcole: this.idEcole,
      idInscriptionScolaire: this.idInscriptionScolaire,
      idClassePedagogique: this.idClassePedagogique,
      dateAffectation: this.dateAffectation,
      motifAffectation: this.motifAffectation,
      active: this.active,
      creePar: this.creePar,
      creeLe: new Date(this.creeLe.getTime()),
      modifiePar: this.modifiePar,
      modifieLe: this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime()),
      version: this.version,
      supprimeLogiquement: this.supprimeLogiquement,
    };
  }

  private marquerModification(modifiePar: UUID): void {
    this.modifiePar = AffectationClasse.nettoyerTexteObligatoire(modifiePar, 'modifiePar');
    this.modifieLe = new Date();
    this.version += 1;
  }

  private static nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurClasseEtInscriptionIncoherentes(`Le champ ${nomChamp} est obligatoire pour l affectation.`);
    }

    return valeur.trim();
  }

  private static nettoyerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  private static validerDateLocale(valeur: LocalDate, nomChamp: string): LocalDate {
    if (typeof valeur !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valeur) || Number.isNaN(Date.parse(`${valeur}T00:00:00.000Z`))) {
      throw new ErreurClasseEtInscriptionIncoherentes(`Le champ ${nomChamp} doit etre une date locale valide au format AAAA-MM-JJ.`);
    }

    return valeur;
  }

  private static validerInstant(valeur: Instant, nomChamp: string): Instant {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurClasseEtInscriptionIncoherentes(`Le champ ${nomChamp} doit etre une date valide.`);
    }

    return new Date(valeur.getTime());
  }

  private static validerInstantOptionnel(valeur: Instant | undefined, nomChamp: string): Instant | undefined {
    return valeur === undefined ? undefined : AffectationClasse.validerInstant(valeur, nomChamp);
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new ErreurClasseEtInscriptionIncoherentes('La version de l affectation doit etre un entier positif.');
    }

    return version;
  }
}
