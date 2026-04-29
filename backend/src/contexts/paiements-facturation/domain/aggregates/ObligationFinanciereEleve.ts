import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ObligationFinanciereCreee } from '../events/ObligationFinanciereCreee';
import { ObligationFinanciereSoldee } from '../events/ObligationFinanciereSoldee';
import { ErreurObligationDejaSoldee } from '../exceptions/ErreurObligationDejaSoldee';
import { ErreurPaiementInvalide } from '../exceptions/ErreurPaiementInvalide';
import { Money } from '../value-objects/Money';
import { OrigineAffectation } from '../value-objects/OrigineAffectation';
import { OrigineObligation } from '../value-objects/OrigineObligation';
import { ReferenceFrais } from '../value-objects/ReferenceFrais';
import { StatutDette } from '../value-objects/StatutDette';
import { TypeFrais } from '../value-objects/TypeFrais';

export interface ProprietesObligationFinanciereEleve {
  idObligation: string;
  idEcole: string;
  idEleve: string;
  idAnneeScolaire: string;
  idInscriptionScolaire?: string;
  typeFrais: TypeFrais;
  referenceFrais: ReferenceFrais;
  libelle: string;
  montantDuHistorique: Money;
  montantPaye: Money;
  montantExonere: Money;
  solde: Money;
  statut: StatutDette;
  origineCreation: OrigineObligation;
  originePaiement?: OrigineAffectation;
  idGrilleTarification?: string;
  creeLe: Date;
  creePar?: string;
  version: number;
}

export class ObligationFinanciereEleve extends RacineAgregat<string> {
  private idEcole: string;
  private idEleve: string;
  private idAnneeScolaire: string;
  private idInscriptionScolaire?: string;
  private typeFrais: TypeFrais;
  private referenceFrais: ReferenceFrais;
  private libelle: string;
  private montantDuHistorique: Money;
  private montantPaye: Money;
  private montantExonere: Money;
  private solde: Money;
  private statut: StatutDette;
  private origineCreation: OrigineObligation;
  private originePaiement?: OrigineAffectation;
  private idGrilleTarification?: string;
  private creeLe: Date;
  private creePar?: string;
  private version: number;

  constructor(proprietes: ProprietesObligationFinanciereEleve) {
    super(ObligationFinanciereEleve.validerTexte(proprietes.idObligation, 'idObligation'));
    this.idEcole = ObligationFinanciereEleve.validerTexte(proprietes.idEcole, 'idEcole');
    this.idEleve = ObligationFinanciereEleve.validerTexte(proprietes.idEleve, 'idEleve');
    this.idAnneeScolaire = ObligationFinanciereEleve.validerTexte(proprietes.idAnneeScolaire, 'idAnneeScolaire');
    this.idInscriptionScolaire = ObligationFinanciereEleve.nettoyerTexteOptionnel(proprietes.idInscriptionScolaire);
    this.typeFrais = proprietes.typeFrais;
    this.referenceFrais = proprietes.referenceFrais;
    this.libelle = ObligationFinanciereEleve.validerTexte(proprietes.libelle, 'libelle');
    this.montantDuHistorique = proprietes.montantDuHistorique;
    this.montantPaye = proprietes.montantPaye;
    this.montantExonere = proprietes.montantExonere;
    this.solde = proprietes.solde;
    this.statut = proprietes.statut;
    this.origineCreation = proprietes.origineCreation;
    this.originePaiement = proprietes.originePaiement;
    this.idGrilleTarification = ObligationFinanciereEleve.nettoyerTexteOptionnel(proprietes.idGrilleTarification);
    this.creeLe = ObligationFinanciereEleve.validerDate(proprietes.creeLe);
    this.creePar = ObligationFinanciereEleve.nettoyerTexteOptionnel(proprietes.creePar);
    this.version = ObligationFinanciereEleve.validerVersion(proprietes.version);
    this.verifierCoherence();
  }

  public static creer(proprietes: Omit<ProprietesObligationFinanciereEleve, 'montantPaye' | 'montantExonere' | 'solde' | 'statut' | 'creeLe' | 'version'> & { creeLe?: Date }): ObligationFinanciereEleve {
    const obligation = new ObligationFinanciereEleve({
      ...proprietes,
      montantPaye: Money.zero(proprietes.montantDuHistorique.obtenirDevise()),
      montantExonere: Money.zero(proprietes.montantDuHistorique.obtenirDevise()),
      solde: proprietes.montantDuHistorique,
      statut: StatutDette.NON_PAYE,
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
    });
    obligation.ajouterEvenement(new ObligationFinanciereCreee(obligation.obtenirId(), obligation.idEcole, obligation.idEleve, obligation.creePar));
    return obligation;
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirIdAnneeScolaire(): string { return this.idAnneeScolaire; }
  public obtenirIdInscriptionScolaire(): string | undefined { return this.idInscriptionScolaire; }
  public obtenirTypeFrais(): TypeFrais { return this.typeFrais; }
  public obtenirReferenceFrais(): ReferenceFrais { return this.referenceFrais; }
  public obtenirLibelle(): string { return this.libelle; }
  public obtenirMontantDuHistorique(): Money { return this.montantDuHistorique; }
  public obtenirMontantPaye(): Money { return this.montantPaye; }
  public obtenirMontantExonere(): Money { return this.montantExonere; }
  public obtenirSolde(): Money { return this.solde; }
  public obtenirStatut(): StatutDette { return this.statut; }
  public obtenirOrigineCreation(): OrigineObligation { return this.origineCreation; }
  public obtenirOriginePaiement(): OrigineAffectation | undefined { return this.originePaiement; }
  public obtenirIdGrilleTarification(): string | undefined { return this.idGrilleTarification; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirCreePar(): string | undefined { return this.creePar; }
  public obtenirVersion(): number { return this.version; }

  public enregistrerPaiement(montant: Money, originePaiement: OrigineAffectation): void {
    if (this.estSoldee()) {
      throw new ErreurObligationDejaSoldee();
    }

    if (montant.estZero() || montant.estSuperieurA(this.solde)) {
      throw new ErreurPaiementInvalide('Le montant affecte sur l obligation est invalide.');
    }

    this.montantPaye = this.montantPaye.additionner(montant);
    this.originePaiement = originePaiement;
    this.recalculerStatut();
  }

  public appliquerExoneration(montant: Money): void {
    if (this.estSoldee()) {
      throw new ErreurObligationDejaSoldee();
    }

    if (montant.estZero() || montant.estSuperieurA(this.solde)) {
      throw new Error('Le montant exonere est invalide.');
    }

    this.montantExonere = this.montantExonere.additionner(montant);
    this.recalculerStatut();
  }

  public annuler(): void {
    this.statut = StatutDette.ANNULE;
    this.version += 1;
  }

  public estSoldee(): boolean {
    return this.statut === StatutDette.SOLDE || this.statut === StatutDette.EXONERE;
  }

  public verifierCoherence(): void {
    const montantCalcule = this.montantPaye.additionner(this.montantExonere).additionner(this.solde);

    if (!montantCalcule.estEgal(this.montantDuHistorique)) {
      throw new Error('L obligation financiere est incoherente avec ses montants.');
    }
  }

  private recalculerStatut(): void {
    this.solde = this.montantDuHistorique.soustraire(this.montantPaye.additionner(this.montantExonere));
    this.version += 1;

    if (this.montantExonere.estEgal(this.montantDuHistorique)) {
      this.statut = StatutDette.EXONERE;
      return;
    }

    if (this.solde.estZero()) {
      this.statut = StatutDette.SOLDE;
      this.ajouterEvenement(new ObligationFinanciereSoldee(this.obtenirId(), this.idEcole, this.idEleve));
      return;
    }

    this.statut = this.montantPaye.estZero() ? StatutDette.NON_PAYE : StatutDette.PARTIEL;
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

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de creation de l obligation est invalide.');
    }
    return new Date(valeur.getTime());
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new Error('La version de l obligation doit etre un entier positif.');
    }
    return version;
  }
}
