import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ResponsableFamille } from '../entities/ResponsableFamille';
import { FamilleCoordonneesModifiees } from '../events/FamilleCoordonneesModifiees';
import { FamilleCreee } from '../events/FamilleCreee';
import { FamilleNombreuseDetectee } from '../events/FamilleNombreuseDetectee';
import { ResponsableFamilleAjoute } from '../events/ResponsableFamilleAjoute';
import { ResponsableFamilleModifie } from '../events/ResponsableFamilleModifie';
import { ResponsableFamilleRetire } from '../events/ResponsableFamilleRetire';
import { ResponsablePrincipalChange } from '../events/ResponsablePrincipalChange';
import { ErreurResponsableFamilleInexistant } from '../exceptions/ErreurResponsableFamilleInexistant';
import { ErreurResponsablePrincipalInvalide } from '../exceptions/ErreurResponsablePrincipalInvalide';
import { Instant, UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier porte l'agregat Famille, responsable du groupe familial et de ses responsables.
export interface ProprietesFamille {
  idFamille: UUID;
  idOrganisation: UUID;
  idEcole: UUID;
  codeFamille: string;
  nomFamille: string;
  adresse?: string;
  telephonePrincipal: string;
  email?: string;
  responsables: ResponsableFamille[];
  creePar: UUID;
  creeLe: Instant;
  modifiePar?: UUID;
  modifieLe?: Instant;
  version: number;
  supprimeLogiquement: boolean;
}

export interface CoordonneesFamilleAModifier {
  nomFamille?: string;
  adresse?: string;
  telephonePrincipal?: string;
  email?: string;
  modifiePar: UUID;
}

/**
 * Cet agregat represente une famille rattachee a une ecole et encadre ses responsables.
 */
export class Famille extends RacineAgregat<UUID> {
  private idOrganisation: UUID;
  private idEcole: UUID;
  private codeFamille: string;
  private nomFamille: string;
  private adresse?: string;
  private telephonePrincipal: string;
  private email?: string;
  private responsables: ResponsableFamille[];
  private creePar: UUID;
  private creeLe: Instant;
  private modifiePar?: UUID;
  private modifieLe?: Instant;
  private version: number;
  private supprimeLogiquement: boolean;

  // Ce constructeur reconstitue une famille complete depuis son etat metier.
  constructor(proprietes: ProprietesFamille) {
    super(Famille.nettoyerTexteObligatoire(proprietes.idFamille, 'idFamille'));
    this.idOrganisation = Famille.nettoyerTexteObligatoire(proprietes.idOrganisation, 'idOrganisation');
    this.idEcole = Famille.nettoyerTexteObligatoire(proprietes.idEcole, 'idEcole');
    this.codeFamille = Famille.nettoyerTexteObligatoire(proprietes.codeFamille, 'codeFamille');
    this.nomFamille = Famille.nettoyerTexteObligatoire(proprietes.nomFamille, 'nomFamille');
    this.adresse = Famille.nettoyerTexteOptionnel(proprietes.adresse);
    this.telephonePrincipal = Famille.nettoyerTexteObligatoire(proprietes.telephonePrincipal, 'telephonePrincipal');
    this.email = Famille.nettoyerTexteOptionnel(proprietes.email);
    this.responsables = [...proprietes.responsables];
    this.creePar = Famille.nettoyerTexteObligatoire(proprietes.creePar, 'creePar');
    this.creeLe = Famille.validerInstant(proprietes.creeLe, 'creeLe');
    this.modifiePar = Famille.nettoyerTexteOptionnel(proprietes.modifiePar);
    this.modifieLe = Famille.validerInstantOptionnel(proprietes.modifieLe, 'modifieLe');
    this.version = Famille.validerVersion(proprietes.version);
    this.supprimeLogiquement = proprietes.supprimeLogiquement;
    this.verifierUniciteResponsables();
    this.verifierResponsablePrincipalUnique();
  }

  /** Cree une nouvelle famille et emet l'evenement de creation. */
  public static creer(proprietes: Omit<ProprietesFamille, 'creeLe' | 'version' | 'supprimeLogiquement'> & { creeLe?: Instant }): Famille {
    const famille = new Famille({
      ...proprietes,
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
      supprimeLogiquement: false,
    });

    famille.ajouterEvenement(new FamilleCreee(famille.idOrganisation, famille.idEcole, famille.creePar, famille.obtenirId()));

    return famille;
  }

  /** Modifie les coordonnees administratives de la famille. */
  public modifierCoordonnees(modification: CoordonneesFamilleAModifier): void {
    this.nomFamille = modification.nomFamille === undefined ? this.nomFamille : Famille.nettoyerTexteObligatoire(modification.nomFamille, 'nomFamille');
    this.adresse = modification.adresse === undefined ? this.adresse : Famille.nettoyerTexteOptionnel(modification.adresse);
    this.telephonePrincipal = modification.telephonePrincipal === undefined ? this.telephonePrincipal : Famille.nettoyerTexteObligatoire(modification.telephonePrincipal, 'telephonePrincipal');
    this.email = modification.email === undefined ? this.email : Famille.nettoyerTexteOptionnel(modification.email);
    this.marquerModification(modification.modifiePar);
    this.ajouterEvenement(new FamilleCoordonneesModifiees(this.idOrganisation, this.idEcole, modification.modifiePar, this.obtenirId()));
  }

  /** Ajoute un responsable a la famille apres verification des doublons. */
  public ajouterResponsable(responsable: ResponsableFamille, modifiePar: UUID): void {
    this.responsables.forEach((responsableExistant) => responsableExistant.verifierNonDupliqueAvec(responsable));
    this.responsables.push(responsable);
    this.verifierResponsablePrincipalUnique();
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new ResponsableFamilleAjoute(this.idOrganisation, this.idEcole, modifiePar, responsable.obtenirId()));
  }

  /** Modifie un responsable deja present dans la famille. */
  public modifierResponsable(responsableModifie: ResponsableFamille, modifiePar: UUID): void {
    const indexResponsable = this.trouverIndexResponsableOuErreur(responsableModifie.obtenirId());
    this.responsables[indexResponsable] = responsableModifie;
    this.verifierUniciteResponsables();
    this.verifierResponsablePrincipalUnique();
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new ResponsableFamilleModifie(this.idOrganisation, this.idEcole, modifiePar, responsableModifie.obtenirId()));
  }

  /** Retire un responsable de la famille sans supprimer l'historique de la famille. */
  public retirerResponsable(idResponsableFamille: UUID, modifiePar: UUID): void {
    const indexResponsable = this.trouverIndexResponsableOuErreur(idResponsableFamille);
    this.responsables.splice(indexResponsable, 1);
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new ResponsableFamilleRetire(this.idOrganisation, this.idEcole, modifiePar, idResponsableFamille));
  }

  /** Definit un unique responsable principal pour la famille. */
  public definirResponsablePrincipal(idResponsableFamille: UUID, modifiePar: UUID): void {
    this.trouverIndexResponsableOuErreur(idResponsableFamille);
    this.responsables.forEach((responsable) => {
      if (responsable.obtenirId() === idResponsableFamille) {
        responsable.devenirPrincipal();
      } else {
        responsable.retirerPrincipalite();
      }
    });
    this.marquerModification(modifiePar);
    this.ajouterEvenement(new ResponsablePrincipalChange(this.idOrganisation, this.idEcole, modifiePar, idResponsableFamille));
  }

  /** Indique si la famille atteint le seuil metier de famille nombreuse. */
  public estFamilleNombreuse(nombreElevesEligibles: number, seuilFamilleNombreuse = 3): boolean {
    const estEligible = this.compterElevesEligibles(nombreElevesEligibles) >= seuilFamilleNombreuse;

    if (estEligible) {
      this.ajouterEvenement(new FamilleNombreuseDetectee(this.idOrganisation, this.idEcole, this.modifiePar ?? this.creePar, this.obtenirId()));
    }

    return estEligible;
  }

  /** Retourne le nombre d'eleves actifs eligibles fourni par le depot ou le service appelant. */
  public compterElevesEligibles(nombreElevesEligibles: number): number {
    if (!Number.isInteger(nombreElevesEligibles) || nombreElevesEligibles < 0) {
      throw new ErreurResponsablePrincipalInvalide('Le nombre d eleves eligibles doit etre un entier positif ou nul.');
    }

    return nombreElevesEligibles;
  }

  /** Verifie que la version attendue correspond a la version courante de la famille. */
  public verifierConcurrence(versionAttendue: number): void {
    if (this.version !== versionAttendue) {
      throw new ErreurResponsablePrincipalInvalide(`La version attendue ${versionAttendue} ne correspond pas a la version courante ${this.version}.`);
    }
  }

  /** Retourne l'organisation proprietaire de la famille. */
  public obtenirIdOrganisation(): UUID { return this.idOrganisation; }
  /** Retourne l'ecole de rattachement de la famille. */
  public obtenirIdEcole(): UUID { return this.idEcole; }
  /** Retourne le code unique de la famille dans l'ecole. */
  public obtenirCodeFamille(): string { return this.codeFamille; }
  /** Retourne le nom administratif de la famille. */
  public obtenirNomFamille(): string { return this.nomFamille; }
  /** Retourne l'adresse de la famille quand elle existe. */
  public obtenirAdresse(): string | undefined { return this.adresse; }
  /** Retourne le telephone principal de la famille. */
  public obtenirTelephonePrincipal(): string { return this.telephonePrincipal; }
  /** Retourne l'email familial quand il existe. */
  public obtenirEmail(): string | undefined { return this.email; }
  /** Retourne une copie des responsables de la famille. */
  public listerResponsables(): ResponsableFamille[] { return [...this.responsables]; }
  /** Retourne la version courante de l'agregat. */
  public obtenirVersion(): number { return this.version; }
  /** Indique si la famille est supprimee logiquement. */
  public estSupprimeLogiquement(): boolean { return this.supprimeLogiquement; }

  /** Retourne toutes les proprietes metier pour les mappers futurs. */
  public versProprietes(): ProprietesFamille {
    return {
      idFamille: this.obtenirId(),
      idOrganisation: this.idOrganisation,
      idEcole: this.idEcole,
      codeFamille: this.codeFamille,
      nomFamille: this.nomFamille,
      adresse: this.adresse,
      telephonePrincipal: this.telephonePrincipal,
      email: this.email,
      responsables: this.listerResponsables(),
      creePar: this.creePar,
      creeLe: new Date(this.creeLe.getTime()),
      modifiePar: this.modifiePar,
      modifieLe: this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime()),
      version: this.version,
      supprimeLogiquement: this.supprimeLogiquement,
    };
  }

  private trouverIndexResponsableOuErreur(idResponsableFamille: UUID): number {
    const indexResponsable = this.responsables.findIndex((responsable) => responsable.obtenirId() === idResponsableFamille);

    if (indexResponsable < 0) {
      throw new ErreurResponsableFamilleInexistant('Le responsable familial demande est introuvable.');
    }

    return indexResponsable;
  }

  private verifierUniciteResponsables(): void {
    for (let indexCourant = 0; indexCourant < this.responsables.length; indexCourant += 1) {
      for (let indexSuivant = indexCourant + 1; indexSuivant < this.responsables.length; indexSuivant += 1) {
        this.responsables[indexCourant].verifierNonDupliqueAvec(this.responsables[indexSuivant]);
      }
    }
  }

  private verifierResponsablePrincipalUnique(): void {
    const responsablesPrincipaux = this.responsables.filter((responsable) => responsable.estResponsablePrincipal());

    if (responsablesPrincipaux.length > 1) {
      throw new ErreurResponsablePrincipalInvalide('Une famille ne peut avoir qu un seul responsable principal.');
    }
  }

  private marquerModification(modifiePar: UUID): void {
    this.modifiePar = Famille.nettoyerTexteObligatoire(modifiePar, 'modifiePar');
    this.modifieLe = new Date();
    this.version += 1;
  }

  private static nettoyerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurResponsablePrincipalInvalide(`Le champ ${nomChamp} est obligatoire pour la famille.`);
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

  private static validerInstant(valeur: Instant, nomChamp: string): Instant {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurResponsablePrincipalInvalide(`Le champ ${nomChamp} doit etre une date valide.`);
    }

    return new Date(valeur.getTime());
  }

  private static validerInstantOptionnel(valeur: Instant | undefined, nomChamp: string): Instant | undefined {
    return valeur === undefined ? undefined : Famille.validerInstant(valeur, nomChamp);
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new ErreurResponsablePrincipalInvalide('La version de la famille doit etre un entier positif.');
    }

    return version;
  }
}
