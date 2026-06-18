import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { TitulariatAttribue } from '../events/TitulariatAttribue';
import { TitulariatExpire } from '../events/TitulariatExpire';
import { TitulariatRetire } from '../events/TitulariatRetire';
import { ErreurTitulariatInvalide } from '../exceptions/ErreurTitulariatInvalide';
import { PolicyTitulariatClasse } from '../policies/PolicyTitulariatClasse';

export interface ProprietesAffectationTitulariat {
  idAffectationTitulariat: string;
  idUtilisateur: string;
  idOrganisation: string;
  idEcole: string;
  idClasse: string;
  idAnneeScolaire: string;
  estActif: boolean;
  dateDebut: Date;
  dateFin?: Date;
  creeLe: Date;
  creePar?: string;
  version: number;
}

// Cet agregat represente le titulariat pedagogique officiel d'une classe.
export class AffectationTitulariat extends RacineAgregat<string> {
  private idUtilisateur: string;
  private idOrganisation: string;
  private idEcole: string;
  private idClasse: string;
  private idAnneeScolaire: string;
  private estActif: boolean;
  private dateDebut: Date;
  private dateFin?: Date;
  private creeLe: Date;
  private creePar?: string;
  private version: number;

  constructor(proprietes: ProprietesAffectationTitulariat) {
    super(AffectationTitulariat.validerTexte(proprietes.idAffectationTitulariat, 'idAffectationTitulariat'));
    this.idUtilisateur = AffectationTitulariat.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.idOrganisation = AffectationTitulariat.validerTexte(proprietes.idOrganisation, 'idOrganisation');
    this.idEcole = AffectationTitulariat.validerTexte(proprietes.idEcole, 'idEcole');
    this.idClasse = AffectationTitulariat.validerTexte(proprietes.idClasse, 'idClasse');
    this.idAnneeScolaire = AffectationTitulariat.validerTexte(proprietes.idAnneeScolaire, 'idAnneeScolaire');
    this.estActif = Boolean(proprietes.estActif);
    this.dateDebut = new Date(proprietes.dateDebut.getTime());
    this.dateFin = proprietes.dateFin ? new Date(proprietes.dateFin.getTime()) : undefined;
    this.creeLe = new Date(proprietes.creeLe.getTime());
    this.creePar = AffectationTitulariat.nettoyerOptionnel(proprietes.creePar);
    this.version = proprietes.version;
  }

  public static attribuer(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClasse: string;
    idAnneeScolaire: string;
    creePar?: string;
    classePossedeDejaTitulaire?: boolean;
  }): AffectationTitulariat {
    PolicyTitulariatClasse.verifier(Boolean(params.classePossedeDejaTitulaire));
    const titulariat = new AffectationTitulariat({
      idAffectationTitulariat: randomUUID(),
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClasse: params.idClasse,
      idAnneeScolaire: params.idAnneeScolaire,
      estActif: true,
      dateDebut: new Date(),
      creeLe: new Date(),
      creePar: params.creePar,
      version: 1,
    });
    titulariat.ajouterEvenement(new TitulariatAttribue(titulariat.obtenirId(), titulariat.idClasse));
    return titulariat;
  }

  public obtenirEstActif(): boolean {
    return this.estActif;
  }

  public obtenirIdUtilisateur(): string {
    return this.idUtilisateur;
  }

  public obtenirIdOrganisation(): string {
    return this.idOrganisation;
  }

  public obtenirIdEcole(): string {
    return this.idEcole;
  }

  public obtenirIdClasse(): string {
    return this.idClasse;
  }

  public obtenirIdAnneeScolaire(): string {
    return this.idAnneeScolaire;
  }

  public obtenirDateDebut(): Date {
    return new Date(this.dateDebut.getTime());
  }

  public obtenirDateFin(): Date | undefined {
    return this.dateFin ? new Date(this.dateFin.getTime()) : undefined;
  }

  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  public obtenirCreePar(): string | undefined {
    return this.creePar;
  }

  public appartientAuScope(idOrganisation?: string, idEcole?: string): boolean {
    if (idOrganisation && this.idOrganisation !== idOrganisation) {
      return false;
    }

    if (idEcole && this.idEcole !== idEcole) {
      return false;
    }

    return true;
  }

  public correspondAClasseAnnee(idClasse: string, idAnneeScolaire: string): boolean {
    return this.idClasse === AffectationTitulariat.validerTexte(idClasse, 'idClasse')
      && this.idAnneeScolaire === AffectationTitulariat.validerTexte(idAnneeScolaire, 'idAnneeScolaire');
  }

  public estActifDansScope(params: {
    idOrganisation?: string;
    idEcole?: string;
    idClasse?: string;
    idAnneeScolaire?: string;
    maintenant?: Date;
  }): boolean {
    if (!this.estActif) {
      return false;
    }

    if (this.dateFin && this.dateFin.getTime() <= (params.maintenant ?? new Date()).getTime()) {
      return false;
    }

    if (!this.appartientAuScope(params.idOrganisation, params.idEcole)) {
      return false;
    }

    if (params.idClasse && params.idAnneeScolaire) {
      return this.correspondAClasseAnnee(params.idClasse, params.idAnneeScolaire);
    }

    if (params.idClasse || params.idAnneeScolaire) {
      return false;
    }

    return true;
  }

  public retirer(dateFin = new Date()): void {
    if (!this.estActif) {
      throw new ErreurTitulariatInvalide('Le titulariat est deja inactif.');
    }

    this.estActif = false;
    this.dateFin = new Date(dateFin.getTime());
    this.version += 1;
    this.ajouterEvenement(new TitulariatRetire(this.obtenirId(), this.idClasse));
  }

  public expirer(dateFin = new Date()): void {
    this.estActif = false;
    this.dateFin = new Date(dateFin.getTime());
    this.version += 1;
    this.ajouterEvenement(new TitulariatExpire(this.obtenirId(), this.idClasse));
  }

  public verifierTitulariat(maintenant = new Date()): void {
    if (!this.estActif || (this.dateFin && this.dateFin.getTime() <= maintenant.getTime())) {
      throw new ErreurTitulariatInvalide();
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre === '' ? undefined : propre;
  }
}
