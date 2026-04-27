import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { InscriptionScolaireAnnulee } from '../events/InscriptionScolaireAnnulee';
import { InscriptionScolaireCreee } from '../events/InscriptionScolaireCreee';
import { InscriptionScolaireValidee } from '../events/InscriptionScolaireValidee';
import { ObservationInscriptionAjoutee } from '../events/ObservationInscriptionAjoutee';
import { ErreurInscriptionAnnulee } from '../exceptions/ErreurInscriptionAnnulee';
import { ErreurInscriptionNonValide } from '../exceptions/ErreurInscriptionNonValide';
import { OrigineInscription } from '../value-objects/OrigineInscription';
import { StatutInscription } from '../value-objects/StatutInscription';
import { Instant, LocalDate, UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier porte l'agregat InscriptionScolaire, c'est-a-dire l'inscription annuelle d'un eleve.
export interface ProprietesInscriptionScolaire {
  idInscriptionScolaire: UUID;
  idOrganisation: UUID;
  idEcole: UUID;
  idEleve: UUID;
  idAnneeScolaire: UUID;
  dateInscription: LocalDate;
  origineInscription: OrigineInscription;
  statutInscription: StatutInscription;
  numeroOrdre?: string;
  observation?: string;
  creePar: UUID;
  creeLe: Instant;
  modifiePar?: UUID;
  modifieLe?: Instant;
  version: number;
  supprimeLogiquement: boolean;
}

/**
 * Cet agregat represente une inscription annuelle et garantit qu'elle reste traçable.
 */
export class InscriptionScolaire extends RacineAgregat<UUID> {
  private idOrganisation: UUID;
  private idEcole: UUID;
  private idEleve: UUID;
  private idAnneeScolaire: UUID;
  private dateInscription: LocalDate;
  private origineInscription: OrigineInscription;
  private statutInscription: StatutInscription;
  private numeroOrdre?: string;
  private observation?: string;
  private creePar: UUID;
  private creeLe: Instant;
  private modifiePar?: UUID;
  private modifieLe?: Instant;
  private version: number;
  private supprimeLogiquement: boolean;

  // Ce constructeur reconstitue une inscription complete depuis son etat metier.
  constructor(proprietes: ProprietesInscriptionScolaire) {
    super(InscriptionScolaire.nettoyerTexteObligatoire(proprietes.idInscriptionScolaire, 'idInscriptionScolaire'));
    this.idOrganisation = InscriptionScolaire.nettoyerTexteObligatoire(proprietes.idOrganisation, 'idOrganisation');
    this.idEcole = InscriptionScolaire.nettoyerTexteObligatoire(proprietes.idEcole, 'idEcole');
    this.idEleve = InscriptionScolaire.nettoyerTexteObligatoire(proprietes.idEleve, 'idEleve');
    this.idAnneeScolaire = InscriptionScolaire.nettoyerTexteObligatoire(proprietes.idAnneeScolaire, 'idAnneeScolaire');
    this.dateInscription = InscriptionScolaire.validerDateLocale(proprietes.dateInscription, 'dateInscription');
    this.origineInscription = InscriptionScolaire.validerOrigine(proprietes.origineInscription);
    this.statutInscription = InscriptionScolaire.validerStatut(proprietes.statutInscription);
    this.numeroOrdre = InscriptionScolaire.nettoyerTexteOptionnel(proprietes.numeroOrdre);
    this.observation = InscriptionScolaire.nettoyerTexteOptionnel(proprietes.observation);
    this.creePar = InscriptionScolaire.nettoyerTexteObligatoire(proprietes.creePar, 'creePar');
    this.creeLe = InscriptionScolaire.validerInstant(proprietes.creeLe, 'creeLe');
    this.modifiePar = InscriptionScolaire.nettoyerTexteOptionnel(proprietes.modifiePar);
    this.modifieLe = InscriptionScolaire.validerInstantOptionnel(proprietes.modifieLe, 'modifieLe');
    this.version = InscriptionScolaire.validerVersion(proprietes.version);
    this.supprimeLogiquement = proprietes.supprimeLogiquement;
  }

  /** Cree une inscription en attente de validation administrative. */
  public static creer(proprietes: Omit<ProprietesInscriptionScolaire, 'statutInscription' | 'creeLe' | 'version' | 'supprimeLogiquement'> & { creeLe?: Instant }): InscriptionScolaire {
    const inscription = new InscriptionScolaire({
      ...proprietes,
      statutInscription: StatutInscription.EN_ATTENTE,
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
      supprimeLogiquement: false,
    });

    inscription.ajouterEvenement(new InscriptionScolaireCreee(inscription.idOrganisation, inscription.idEcole, inscription.creePar, inscription.obtenirId()));

    return inscription;
  }

  /** Valide l'inscription afin qu'elle devienne exploitable pour l'annee scolaire. */
  public valider(modifiePar: UUID): void {
    this.verifierActivationPossible();
    this.statutInscription = StatutInscription.VALIDEE;
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new InscriptionScolaireValidee(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Annule l'inscription sans la supprimer physiquement. */
  public annuler(modifiePar: UUID): void {
    if (this.statutInscription === StatutInscription.ANNULEE) {
      throw new ErreurInscriptionAnnulee('Cette inscription est deja annulee.');
    }

    this.statutInscription = StatutInscription.ANNULEE;
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new InscriptionScolaireAnnulee(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Ajoute ou remplace l'observation administrative de l'inscription. */
  public ajouterObservation(observation: string, modifiePar: UUID): void {
    if (this.statutInscription === StatutInscription.ANNULEE) {
      throw new ErreurInscriptionAnnulee('Une inscription annulee ne peut plus recevoir d observation active.');
    }

    this.observation = InscriptionScolaire.nettoyerTexteObligatoire(observation, 'observation');
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new ObservationInscriptionAjoutee(this.idOrganisation, this.idEcole, modifiePar, this.obtenirId()));
  }

  /** Verifie qu'une inscription peut etre validee. */
  public verifierActivationPossible(): void {
    if (this.statutInscription === StatutInscription.ANNULEE) {
      throw new ErreurInscriptionAnnulee('Une inscription annulee ne peut pas etre validee.');
    }

    if (this.statutInscription === StatutInscription.VALIDEE) {
      throw new ErreurInscriptionNonValide('Une inscription validee ne peut pas etre validee une seconde fois silencieusement.');
    }
  }

  /** Verifie que la version attendue correspond a la version courante. */
  public verifierConcurrence(versionAttendue: number): void {
    if (this.version !== versionAttendue) {
      throw new ErreurInscriptionNonValide(`La version attendue ${versionAttendue} ne correspond pas a la version courante ${this.version}.`);
    }
  }

  /** Retourne l'organisation proprietaire de l'inscription. */
  public obtenirIdOrganisation(): UUID { return this.idOrganisation; }
  /** Retourne l'ecole de l'inscription. */
  public obtenirIdEcole(): UUID { return this.idEcole; }
  /** Retourne l'eleve inscrit. */
  public obtenirIdEleve(): UUID { return this.idEleve; }
  /** Retourne l'annee scolaire de l'inscription. */
  public obtenirIdAnneeScolaire(): UUID { return this.idAnneeScolaire; }
  /** Retourne la date d'inscription. */
  public obtenirDateInscription(): LocalDate { return this.dateInscription; }
  /** Retourne l'origine administrative de l'inscription. */
  public obtenirOrigineInscription(): OrigineInscription { return this.origineInscription; }
  /** Retourne le statut courant de l'inscription. */
  public obtenirStatutInscription(): StatutInscription { return this.statutInscription; }
  /** Retourne le numero d'ordre quand il existe. */
  public obtenirNumeroOrdre(): string | undefined { return this.numeroOrdre; }
  /** Retourne l'observation administrative quand elle existe. */
  public obtenirObservation(): string | undefined { return this.observation; }
  /** Retourne la version courante de l'inscription. */
  public obtenirVersion(): number { return this.version; }
  /** Indique si l'inscription est active et validee. */
  public estActive(): boolean { return this.statutInscription === StatutInscription.VALIDEE && !this.supprimeLogiquement; }

  /** Retourne toutes les proprietes metier pour les mappers futurs. */
  public versProprietes(): ProprietesInscriptionScolaire {
    return {
      idInscriptionScolaire: this.obtenirId(),
      idOrganisation: this.idOrganisation,
      idEcole: this.idEcole,
      idEleve: this.idEleve,
      idAnneeScolaire: this.idAnneeScolaire,
      dateInscription: this.dateInscription,
      origineInscription: this.origineInscription,
      statutInscription: this.statutInscription,
      numeroOrdre: this.numeroOrdre,
      observation: this.observation,
      creePar: this.creePar,
      creeLe: new Date(this.creeLe.getTime()),
      modifiePar: this.modifiePar,
      modifieLe: this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime()),
      version: this.version,
      supprimeLogiquement: this.supprimeLogiquement,
    };
  }

  private marquerModification(modifiePar: UUID): void {
    this.modifiePar = InscriptionScolaire.nettoyerTexteObligatoire(modifiePar, 'modifiePar');
    this.modifieLe = new Date();
    this.version += 1;
  }

  private static nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurInscriptionNonValide(`Le champ ${nomChamp} est obligatoire pour l inscription.`);
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

  private static validerOrigine(origine: OrigineInscription): OrigineInscription {
    if (!Object.values(OrigineInscription).includes(origine)) {
      throw new ErreurInscriptionNonValide('L origine de l inscription est invalide.');
    }

    return origine;
  }

  private static validerStatut(statut: StatutInscription): StatutInscription {
    if (!Object.values(StatutInscription).includes(statut)) {
      throw new ErreurInscriptionNonValide('Le statut de l inscription est invalide.');
    }

    return statut;
  }

  private static validerDateLocale(valeur: LocalDate, nomChamp: string): LocalDate {
    if (typeof valeur !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valeur) || Number.isNaN(Date.parse(`${valeur}T00:00:00.000Z`))) {
      throw new ErreurInscriptionNonValide(`Le champ ${nomChamp} doit etre une date locale valide au format AAAA-MM-JJ.`);
    }

    return valeur;
  }

  private static validerInstant(valeur: Instant, nomChamp: string): Instant {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurInscriptionNonValide(`Le champ ${nomChamp} doit etre une date valide.`);
    }

    return new Date(valeur.getTime());
  }

  private static validerInstantOptionnel(valeur: Instant | undefined, nomChamp: string): Instant | undefined {
    return valeur === undefined ? undefined : InscriptionScolaire.validerInstant(valeur, nomChamp);
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new ErreurInscriptionNonValide('La version de l inscription doit etre un entier positif.');
    }

    return version;
  }
}
