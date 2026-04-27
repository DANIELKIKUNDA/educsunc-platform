import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { EleveAbandonne } from '../events/EleveAbandonne';
import { EleveCree } from '../events/EleveCree';
import { EleveDecede } from '../events/EleveDecede';
import { EleveDetacheFamille } from '../events/EleveDetacheFamille';
import { EleveEcoleProvenanceModifiee } from '../events/EleveEcoleProvenanceModifiee';
import { EleveIdentiteModifiee } from '../events/EleveIdentiteModifiee';
import { EleveMarqueInactif } from '../events/EleveMarqueInactif';
import { EleveRattacheFamille } from '../events/EleveRattacheFamille';
import { EleveReactive } from '../events/EleveReactive';
import { EleveStatutGlobalChange } from '../events/EleveStatutGlobalChange';
import { EleveSuspendu } from '../events/EleveSuspendu';
import { EleveTransfere } from '../events/EleveTransfere';
import { ErreurEleveDejaDecede } from '../exceptions/ErreurEleveDejaDecede';
import { ErreurStatutEleveInvalide } from '../exceptions/ErreurStatutEleveInvalide';
import { ErreurSuppressionPhysiqueInterdite } from '../exceptions/ErreurSuppressionPhysiqueInterdite';
import { ErreurTransitionStatutInterdite } from '../exceptions/ErreurTransitionStatutInterdite';
import { EcoleProvenance } from '../value-objects/EcoleProvenance';
import { SexeEleve } from '../value-objects/SexeEleve';
import { StatutEleve } from '../value-objects/StatutEleve';
import { Instant, LocalDate, UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier porte l'agregat Eleve, source de verite de l'identite permanente de l'eleve.
export interface ProprietesEleve {
  idEleve: UUID;
  idOrganisation: UUID;
  idEcole: UUID;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: SexeEleve;
  dateNaissance: LocalDate;
  lieuNaissance?: string;
  nationalite?: string;
  ecoleProvenance: EcoleProvenance;
  idFamille?: UUID;
  statutGlobal: StatutEleve;
  creePar: UUID;
  creeLe: Instant;
  modifiePar?: UUID;
  modifieLe?: Instant;
  version: number;
  supprimeLogiquement: boolean;
}

export interface IdentiteEleveAModifier {
  matricule?: string;
  nom?: string;
  postNom?: string;
  prenom?: string;
  sexe?: SexeEleve;
  dateNaissance?: LocalDate;
  lieuNaissance?: string;
  nationalite?: string;
  modifiePar: UUID;
}

/**
 * Cet agregat represente l'identite permanente de l'eleve, independamment de ses inscriptions annuelles.
 */
export class Eleve extends RacineAgregat<UUID> {
  private idOrganisation: UUID;
  private idEcole: UUID;
  private matricule: string;
  private nom: string;
  private postNom: string;
  private prenom?: string;
  private sexe: SexeEleve;
  private dateNaissance: LocalDate;
  private lieuNaissance?: string;
  private nationalite?: string;
  private ecoleProvenance: EcoleProvenance;
  private idFamille?: UUID;
  private statutGlobal: StatutEleve;
  private creePar: UUID;
  private creeLe: Instant;
  private modifiePar?: UUID;
  private modifieLe?: Instant;
  private version: number;
  private supprimeLogiquement: boolean;

  // Ce constructeur reconstitue un eleve complet depuis des proprietes metier.
  constructor(proprietes: ProprietesEleve) {
    super(Eleve.validerIdentifiantObligatoire(proprietes.idEleve, 'idEleve'));
    this.idOrganisation = Eleve.validerIdentifiantObligatoire(proprietes.idOrganisation, 'idOrganisation');
    this.idEcole = Eleve.validerIdentifiantObligatoire(proprietes.idEcole, 'idEcole');
    this.matricule = Eleve.nettoyerTexteObligatoire(proprietes.matricule, 'matricule');
    this.nom = Eleve.nettoyerTexteObligatoire(proprietes.nom, 'nom');
    this.postNom = Eleve.nettoyerTexteObligatoire(proprietes.postNom, 'postNom');
    this.prenom = Eleve.nettoyerTexteOptionnel(proprietes.prenom);
    this.sexe = Eleve.validerSexe(proprietes.sexe);
    this.dateNaissance = Eleve.validerDateLocale(proprietes.dateNaissance, 'dateNaissance');
    this.lieuNaissance = Eleve.nettoyerTexteOptionnel(proprietes.lieuNaissance);
    this.nationalite = Eleve.nettoyerTexteOptionnel(proprietes.nationalite);
    this.ecoleProvenance = proprietes.ecoleProvenance;
    this.idFamille = Eleve.nettoyerIdentifiantOptionnel(proprietes.idFamille);
    this.statutGlobal = Eleve.validerStatut(proprietes.statutGlobal);
    this.creePar = Eleve.validerIdentifiantObligatoire(proprietes.creePar, 'creePar');
    this.creeLe = Eleve.validerInstant(proprietes.creeLe, 'creeLe');
    this.modifiePar = Eleve.nettoyerIdentifiantOptionnel(proprietes.modifiePar);
    this.modifieLe = Eleve.validerInstantOptionnel(proprietes.modifieLe, 'modifieLe');
    this.version = Eleve.validerVersion(proprietes.version);
    this.supprimeLogiquement = proprietes.supprimeLogiquement;
    this.verifierCoherenceIdentite();
  }

  /** Cree un nouvel eleve actif et emet l'evenement de creation. */
  public static creer(proprietes: Omit<ProprietesEleve, 'statutGlobal' | 'creeLe' | 'version' | 'supprimeLogiquement'> & { creeLe?: Instant }): Eleve {
    const eleve = new Eleve({
      ...proprietes,
      statutGlobal: StatutEleve.ACTIF,
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
      supprimeLogiquement: false,
    });

    eleve.ajouterEvenement(new EleveCree(eleve.idOrganisation, eleve.idEcole, eleve.creePar, eleve.obtenirId()));

    return eleve;
  }

  /** Modifie les champs d'identite de l'eleve sans changer son historique scolaire. */
  public modifierIdentite(modification: IdentiteEleveAModifier): void {
    this.verifierQueModificationEleveActifEstPossible();
    this.matricule = modification.matricule === undefined ? this.matricule : Eleve.nettoyerTexteObligatoire(modification.matricule, 'matricule');
    this.nom = modification.nom === undefined ? this.nom : Eleve.nettoyerTexteObligatoire(modification.nom, 'nom');
    this.postNom = modification.postNom === undefined ? this.postNom : Eleve.nettoyerTexteObligatoire(modification.postNom, 'postNom');
    this.prenom = modification.prenom === undefined ? this.prenom : Eleve.nettoyerTexteOptionnel(modification.prenom);
    this.sexe = modification.sexe === undefined ? this.sexe : Eleve.validerSexe(modification.sexe);
    this.dateNaissance = modification.dateNaissance === undefined ? this.dateNaissance : Eleve.validerDateLocale(modification.dateNaissance, 'dateNaissance');
    this.lieuNaissance = modification.lieuNaissance === undefined ? this.lieuNaissance : Eleve.nettoyerTexteOptionnel(modification.lieuNaissance);
    this.nationalite = modification.nationalite === undefined ? this.nationalite : Eleve.nettoyerTexteOptionnel(modification.nationalite);
    this.marquerModification(modification.modifiePar);
    this.verifierCoherenceIdentite();
    this.ajouterEvenement(new EleveIdentiteModifiee(this.idOrganisation, this.idEcole, modification.modifiePar, this.obtenirId()));
  }

  /** Rattache l'eleve a une famille existante de la meme ecole. */
  public rattacherFamille(idFamille: UUID, modifiePar: UUID): void {
    this.verifierQueModificationEleveActifEstPossible();
    this.idFamille = Eleve.validerIdentifiantObligatoire(idFamille, 'idFamille');
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new EleveRattacheFamille(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Detache l'eleve de sa famille administrative sans supprimer la famille. */
  public detacherFamille(modifiePar: UUID): void {
    this.verifierQueModificationEleveActifEstPossible();
    this.idFamille = undefined;
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new EleveDetacheFamille(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Met a jour l'ecole de provenance conservee sur l'identite de l'eleve. */
  public modifierEcoleProvenance(ecoleProvenance: EcoleProvenance, modifiePar: UUID): void {
    this.verifierQueModificationEleveActifEstPossible();
    this.ecoleProvenance = ecoleProvenance;
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new EleveEcoleProvenanceModifiee(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Marque l'eleve comme abandonne tout en le conservant dans le systeme. */
  public marquerAbandonne(modifiePar: UUID): void {
    this.changerStatut(StatutEleve.ABANDONNE, modifiePar, new EleveAbandonne(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Marque l'eleve comme transfere hors de l'ecole source. */
  public marquerTransfere(modifiePar: UUID): void {
    this.changerStatut(StatutEleve.TRANSFERE, modifiePar, new EleveTransfere(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Marque l'eleve comme decede, et rend cet etat final. */
  public marquerDecede(modifiePar: UUID): void {
    this.changerStatut(StatutEleve.DECEDE, modifiePar, new EleveDecede(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Suspend temporairement l'eleve pour decision administrative. */
  public suspendre(modifiePar: UUID): void {
    this.changerStatut(StatutEleve.SUSPENDU, modifiePar, new EleveSuspendu(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Reactive un eleve suspendu, inactif, abandonne ou reintegre explicitement. */
  public reactiver(modifiePar: UUID): void {
    this.changerStatut(StatutEleve.ACTIF, modifiePar, new EleveReactive(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Marque l'eleve comme inactif sans le confondre avec un abandon ou un transfert. */
  public marquerInactif(modifiePar: UUID): void {
    this.changerStatut(StatutEleve.INACTIF, modifiePar, new EleveMarqueInactif(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Verifie les invariants permanents de l'identite de l'eleve. */
  public verifierCoherenceIdentite(): void {
    Eleve.nettoyerTexteObligatoire(this.nom, 'nom');
    Eleve.nettoyerTexteObligatoire(this.postNom, 'postNom');
    Eleve.validerSexe(this.sexe);
    Eleve.validerDateLocale(this.dateNaissance, 'dateNaissance');
  }

  /** Verifie que la version attendue correspond a la version courante de l'agregat. */
  public verifierConcurrence(versionAttendue: number): void {
    if (this.version !== versionAttendue) {
      throw new ErreurTransitionStatutInterdite(`La version attendue ${versionAttendue} ne correspond pas a la version courante ${this.version}.`);
    }
  }

  /** Interdit explicitement la suppression physique de l'eleve. */
  public supprimerPhysiquement(): never {
    throw new ErreurSuppressionPhysiqueInterdite('Un eleve ne peut pas etre supprime physiquement.');
  }

  /** Retourne l'organisation proprietaire de l'eleve. */
  public obtenirIdOrganisation(): UUID { return this.idOrganisation; }
  /** Retourne l'ecole exploitante de l'eleve. */
  public obtenirIdEcole(): UUID { return this.idEcole; }
  /** Retourne le matricule unique dans l'ecole. */
  public obtenirMatricule(): string { return this.matricule; }
  /** Retourne le nom de l'eleve. */
  public obtenirNom(): string { return this.nom; }
  /** Retourne le post-nom de l'eleve. */
  public obtenirPostNom(): string { return this.postNom; }
  /** Retourne le prenom facultatif de l'eleve. */
  public obtenirPrenom(): string | undefined { return this.prenom; }
  /** Retourne le sexe de l'eleve. */
  public obtenirSexe(): SexeEleve { return this.sexe; }
  /** Retourne la date de naissance de l'eleve. */
  public obtenirDateNaissance(): LocalDate { return this.dateNaissance; }
  /** Retourne le lieu de naissance quand il existe. */
  public obtenirLieuNaissance(): string | undefined { return this.lieuNaissance; }
  /** Retourne la nationalite quand elle existe. */
  public obtenirNationalite(): string | undefined { return this.nationalite; }
  /** Retourne la provenance scolaire de l'eleve. */
  public obtenirEcoleProvenance(): EcoleProvenance { return this.ecoleProvenance; }
  /** Retourne la famille rattachee quand elle existe. */
  public obtenirIdFamille(): UUID | undefined { return this.idFamille; }
  /** Retourne le statut global de l'eleve. */
  public obtenirStatutGlobal(): StatutEleve { return this.statutGlobal; }
  /** Retourne l'acteur de creation. */
  public obtenirCreePar(): UUID { return this.creePar; }
  /** Retourne la date de creation. */
  public obtenirCreeLe(): Instant { return new Date(this.creeLe.getTime()); }
  /** Retourne l'acteur de derniere modification. */
  public obtenirModifiePar(): UUID | undefined { return this.modifiePar; }
  /** Retourne la date de derniere modification. */
  public obtenirModifieLe(): Instant | undefined { return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime()); }
  /** Retourne la version courante de l'agregat. */
  public obtenirVersion(): number { return this.version; }
  /** Indique si l'eleve est supprime logiquement. */
  public estSupprimeLogiquement(): boolean { return this.supprimeLogiquement; }
  /** Indique si l'eleve est exploitable dans les operations scolaires courantes. */
  public estActif(): boolean { return this.statutGlobal === StatutEleve.ACTIF && !this.supprimeLogiquement; }

  /** Retourne toutes les proprietes metier pour les mappers futurs. */
  public versProprietes(): ProprietesEleve {
    return {
      idEleve: this.obtenirId(),
      idOrganisation: this.idOrganisation,
      idEcole: this.idEcole,
      matricule: this.matricule,
      nom: this.nom,
      postNom: this.postNom,
      prenom: this.prenom,
      sexe: this.sexe,
      dateNaissance: this.dateNaissance,
      lieuNaissance: this.lieuNaissance,
      nationalite: this.nationalite,
      ecoleProvenance: this.ecoleProvenance,
      idFamille: this.idFamille,
      statutGlobal: this.statutGlobal,
      creePar: this.creePar,
      creeLe: this.obtenirCreeLe(),
      modifiePar: this.modifiePar,
      modifieLe: this.obtenirModifieLe(),
      version: this.version,
      supprimeLogiquement: this.supprimeLogiquement,
    };
  }

  private changerStatut(nouveauStatut: StatutEleve, modifiePar: UUID, evenementSpecifique: EleveStatutGlobalChange): void {
    if (this.statutGlobal === StatutEleve.DECEDE && nouveauStatut !== StatutEleve.DECEDE) {
      throw new ErreurEleveDejaDecede('Un eleve decede ne peut plus changer vers un statut actif ou administratif.');
    }

    if (this.statutGlobal === nouveauStatut) {
      return;
    }

    this.statutGlobal = Eleve.validerStatut(nouveauStatut);
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new EleveStatutGlobalChange(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
    this.ajouterEvenement(evenementSpecifique);
  }

  private verifierQueModificationEleveActifEstPossible(): void {
    if (this.statutGlobal === StatutEleve.DECEDE) {
      throw new ErreurEleveDejaDecede('Un eleve decede ne peut plus etre modifie comme eleve actif.');
    }
  }

  private marquerModification(modifiePar: UUID): void {
    this.modifiePar = Eleve.validerIdentifiantObligatoire(modifiePar, 'modifiePar');
    this.modifieLe = new Date();
    this.version += 1;
  }

  private static validerIdentifiantObligatoire(valeur: UUID, nomChamp: string): UUID {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurStatutEleveInvalide(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }

  private static nettoyerIdentifiantOptionnel(valeur?: UUID): UUID | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  private static nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurStatutEleveInvalide(`Le champ ${nomChamp} est obligatoire pour l eleve.`);
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

  private static validerSexe(sexe: SexeEleve): SexeEleve {
    if (!Object.values(SexeEleve).includes(sexe)) {
      throw new ErreurStatutEleveInvalide('Le sexe de l eleve est invalide.');
    }

    return sexe;
  }

  private static validerStatut(statut: StatutEleve): StatutEleve {
    if (!Object.values(StatutEleve).includes(statut)) {
      throw new ErreurStatutEleveInvalide('Le statut global de l eleve est invalide.');
    }

    return statut;
  }

  private static validerDateLocale(valeur: LocalDate, nomChamp: string): LocalDate {
    if (typeof valeur !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valeur) || Number.isNaN(Date.parse(`${valeur}T00:00:00.000Z`))) {
      throw new ErreurStatutEleveInvalide(`Le champ ${nomChamp} doit etre une date locale valide au format AAAA-MM-JJ.`);
    }

    return valeur;
  }

  private static validerInstant(valeur: Instant, nomChamp: string): Instant {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurStatutEleveInvalide(`Le champ ${nomChamp} doit etre une date valide.`);
    }

    return new Date(valeur.getTime());
  }

  private static validerInstantOptionnel(valeur: Instant | undefined, nomChamp: string): Instant | undefined {
    return valeur === undefined ? undefined : Eleve.validerInstant(valeur, nomChamp);
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new ErreurStatutEleveInvalide('La version de l eleve doit etre un entier positif.');
    }

    return version;
  }
}
