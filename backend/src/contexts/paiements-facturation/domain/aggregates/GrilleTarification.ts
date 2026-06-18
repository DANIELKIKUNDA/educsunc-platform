import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { GrilleTarificationCreee } from '../events/GrilleTarificationCreee';
import { GrilleTarificationModifiee } from '../events/GrilleTarificationModifiee';
import { CategorieFraisEtat } from '../value-objects/CategorieFraisEtat';
import { CategorieTechnique } from '../value-objects/CategorieTechnique';
import { Money } from '../value-objects/Money';
import { MoisScolaire } from '../value-objects/MoisScolaire';
import { TrancheFraisEtat } from '../value-objects/TrancheFraisEtat';
import { TypeFrais } from '../value-objects/TypeFrais';

export interface ProprietesGrilleTarification {
  idGrilleTarification: string;
  idOrganisation?: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeFrais: TypeFrais;
  libelle: string;
  montant: Money;
  section?: string;
  categorieFraisEtat?: CategorieFraisEtat;
  categorieTechnique?: CategorieTechnique;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  moisScolaire?: MoisScolaire;
  trancheFraisEtat?: TrancheFraisEtat;
  obligatoire: boolean;
  actif: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
  creePar: string;
  creeLe: Date;
  modifiePar?: string;
  modifieLe?: Date;
  version: number;
}

export class GrilleTarification extends RacineAgregat<string> {
  private idOrganisation?: string;
  private idEcole: string;
  private idAnneeScolaire: string;
  private typeFrais: TypeFrais;
  private libelle: string;
  private montant: Money;
  private section?: string;
  private categorieFraisEtat?: CategorieFraisEtat;
  private categorieTechnique?: CategorieTechnique;
  private estClasseTENASOSP?: boolean;
  private estClasseEXETAT?: boolean;
  private estClasseFinaliste?: boolean;
  private moisScolaire?: MoisScolaire;
  private trancheFraisEtat?: TrancheFraisEtat;
  private obligatoire: boolean;
  private actif: boolean;
  private dateDebutValidite?: string;
  private dateFinValidite?: string;
  private creePar: string;
  private creeLe: Date;
  private modifiePar?: string;
  private modifieLe?: Date;
  private version: number;

  constructor(proprietes: ProprietesGrilleTarification) {
    super(GrilleTarification.validerTexte(proprietes.idGrilleTarification, 'idGrilleTarification'));
    this.idOrganisation = GrilleTarification.nettoyerTexteOptionnel(proprietes.idOrganisation);
    this.idEcole = GrilleTarification.validerTexte(proprietes.idEcole, 'idEcole');
    this.idAnneeScolaire = GrilleTarification.validerTexte(proprietes.idAnneeScolaire, 'idAnneeScolaire');
    this.typeFrais = proprietes.typeFrais;
    this.libelle = GrilleTarification.validerTexte(proprietes.libelle, 'libelle');
    this.montant = proprietes.montant;
    this.section = GrilleTarification.nettoyerTexteOptionnel(proprietes.section);
    this.categorieFraisEtat = proprietes.categorieFraisEtat;
    this.categorieTechnique = proprietes.categorieTechnique;
    this.estClasseTENASOSP = proprietes.estClasseTENASOSP;
    this.estClasseEXETAT = proprietes.estClasseEXETAT;
    this.estClasseFinaliste = proprietes.estClasseFinaliste;
    this.moisScolaire = proprietes.moisScolaire;
    this.trancheFraisEtat = proprietes.trancheFraisEtat;
    this.obligatoire = proprietes.obligatoire;
    this.actif = proprietes.actif;
    this.dateDebutValidite = proprietes.dateDebutValidite;
    this.dateFinValidite = proprietes.dateFinValidite;
    this.creePar = GrilleTarification.validerTexte(proprietes.creePar, 'creePar');
    this.creeLe = GrilleTarification.validerDate(proprietes.creeLe, 'creeLe');
    this.modifiePar = GrilleTarification.nettoyerTexteOptionnel(proprietes.modifiePar);
    this.modifieLe = proprietes.modifieLe === undefined ? undefined : GrilleTarification.validerDate(proprietes.modifieLe, 'modifieLe');
    this.version = GrilleTarification.validerVersion(proprietes.version);
    this.verifierCoherence();
  }

  public static creer(proprietes: Omit<ProprietesGrilleTarification, 'creeLe' | 'version'> & { creeLe?: Date }): GrilleTarification {
    const grille = new GrilleTarification({
      ...proprietes,
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
    });
    grille.ajouterEvenement(new GrilleTarificationCreee(grille.obtenirId(), grille.idEcole, grille.creePar, grille.creeLe));
    return grille;
  }

  public obtenirIdOrganisation(): string | undefined { return this.idOrganisation; }
  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdAnneeScolaire(): string { return this.idAnneeScolaire; }
  public obtenirTypeFrais(): TypeFrais { return this.typeFrais; }
  public obtenirLibelle(): string { return this.libelle; }
  public obtenirMontant(): Money { return this.montant; }
  public obtenirSection(): string | undefined { return this.section; }
  public obtenirCategorieFraisEtat(): CategorieFraisEtat | undefined { return this.categorieFraisEtat; }
  public obtenirCategorieTechnique(): CategorieTechnique | undefined { return this.categorieTechnique; }
  public obtenirEstClasseTENASOSP(): boolean | undefined { return this.estClasseTENASOSP; }
  public obtenirEstClasseEXETAT(): boolean | undefined { return this.estClasseEXETAT; }
  public obtenirEstClasseFinaliste(): boolean | undefined { return this.estClasseFinaliste; }
  public obtenirMoisScolaire(): MoisScolaire | undefined { return this.moisScolaire; }
  public obtenirTrancheFraisEtat(): TrancheFraisEtat | undefined { return this.trancheFraisEtat; }
  public obtenirObligatoire(): boolean { return this.obligatoire; }
  public obtenirActif(): boolean { return this.actif; }
  public obtenirDateDebutValidite(): string | undefined { return this.dateDebutValidite; }
  public obtenirDateFinValidite(): string | undefined { return this.dateFinValidite; }
  public obtenirCreePar(): string { return this.creePar; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirModifiePar(): string | undefined { return this.modifiePar; }
  public obtenirModifieLe(): Date | undefined { return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime()); }
  public obtenirVersion(): number { return this.version; }

  public modifierMontant(nouveauMontant: Money, modifiePar: string): void {
    this.montant = nouveauMontant;
    this.marquerModification(modifiePar);
  }

  public reconfigurer(proprietes: {
    libelle?: string;
    montant?: Money;
    section?: string;
    categorieFraisEtat?: CategorieFraisEtat;
    categorieTechnique?: CategorieTechnique;
    estClasseTENASOSP?: boolean;
    estClasseEXETAT?: boolean;
    estClasseFinaliste?: boolean;
    moisScolaire?: MoisScolaire;
    trancheFraisEtat?: TrancheFraisEtat;
    obligatoire?: boolean;
    dateDebutValidite?: string;
    dateFinValidite?: string;
  }, modifiePar: string): void {
    if (proprietes.libelle !== undefined) {
      this.libelle = GrilleTarification.validerTexte(proprietes.libelle, 'libelle');
    }

    if (proprietes.montant !== undefined) {
      this.montant = proprietes.montant;
    }

    if (proprietes.section !== undefined) {
      this.section = GrilleTarification.nettoyerTexteOptionnel(proprietes.section);
    }

    if (proprietes.categorieFraisEtat !== undefined) {
      this.categorieFraisEtat = proprietes.categorieFraisEtat;
    }

    if (proprietes.categorieTechnique !== undefined) {
      this.categorieTechnique = proprietes.categorieTechnique;
    }

    if (proprietes.estClasseTENASOSP !== undefined) {
      this.estClasseTENASOSP = proprietes.estClasseTENASOSP;
    }

    if (proprietes.estClasseEXETAT !== undefined) {
      this.estClasseEXETAT = proprietes.estClasseEXETAT;
    }

    if (proprietes.estClasseFinaliste !== undefined) {
      this.estClasseFinaliste = proprietes.estClasseFinaliste;
    }

    if (proprietes.moisScolaire !== undefined) {
      this.moisScolaire = proprietes.moisScolaire;
    }

    if (proprietes.trancheFraisEtat !== undefined) {
      this.trancheFraisEtat = proprietes.trancheFraisEtat;
    }

    if (proprietes.obligatoire !== undefined) {
      this.obligatoire = proprietes.obligatoire;
    }

    if (proprietes.dateDebutValidite !== undefined) {
      this.dateDebutValidite = GrilleTarification.nettoyerTexteOptionnel(
        proprietes.dateDebutValidite,
      );
    }

    if (proprietes.dateFinValidite !== undefined) {
      this.dateFinValidite = GrilleTarification.nettoyerTexteOptionnel(
        proprietes.dateFinValidite,
      );
    }

    this.verifierCoherence();
    this.marquerModification(modifiePar);
  }

  public renommer(libelle: string, modifiePar: string): void {
    this.libelle = GrilleTarification.validerTexte(libelle, 'libelle');
    this.marquerModification(modifiePar);
  }

  public activer(modifiePar: string): void {
    this.actif = true;
    this.marquerModification(modifiePar);
  }

  public desactiver(modifiePar: string): void {
    this.actif = false;
    this.marquerModification(modifiePar);
  }

  public verifierCoherence(): void {
    if (this.dateDebutValidite !== undefined && this.dateFinValidite !== undefined && this.dateDebutValidite > this.dateFinValidite) {
      throw new Error('La date de debut de validite doit etre anterieure ou egale a la date de fin.');
    }

    if (this.typeFrais === TypeFrais.FRAIS_ETAT && this.categorieFraisEtat === undefined) {
      throw new Error('Les frais Etat exigent une categorie de frais Etat.');
    }

    if (this.typeFrais === TypeFrais.FRAIS_TECHNIQUES && this.categorieTechnique === undefined) {
      throw new Error('Les frais techniques exigent une categorie technique.');
    }
  }

  private marquerModification(modifiePar: string): void {
    this.modifiePar = GrilleTarification.validerTexte(modifiePar, 'modifiePar');
    this.modifieLe = new Date();
    this.version += 1;
    this.ajouterEvenement(new GrilleTarificationModifiee(this.obtenirId(), this.idEcole, this.modifiePar, this.modifieLe));
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
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

  private static validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${nomChamp} doit etre une date valide.`);
    }
    return new Date(valeur.getTime());
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new Error('La version de la grille doit etre un entier positif.');
    }
    return version;
  }
}
