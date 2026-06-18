import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { CaisseJourCloturee } from '../events/CaisseJourCloturee';
import { CaisseJourOuverte } from '../events/CaisseJourOuverte';
import { OperationCaisseAjoutee } from '../events/OperationCaisseAjoutee';
import { OperationCaisse } from '../entities/OperationCaisse';
import { Money } from '../value-objects/Money';
import { ModePaiement } from '../value-objects/ModePaiement';
import { StatutCaisse } from '../value-objects/StatutCaisse';
import { TypeOperationCaisse } from '../value-objects/TypeOperationCaisse';

export interface ProprietesCaisseJour {
  idCaisseJour: string;
  idEcole: string;
  dateCaisse: string;
  statut: StatutCaisse;
  operations: OperationCaisse[];
  totalEncaisse: Money;
  totalCash: Money;
  totalMobileMoney: Money;
  totalParCaissier: Map<string, Money>;
  totalFondsAnticipes: Money;
  totalFondsConsommes: Money;
  disponibleReel: Money;
  ouvertePar: string;
  ouverteLe: Date;
  clotureePar?: string;
  clotureeLe?: Date;
  version: number;
}

export class CaisseJour extends RacineAgregat<string> {
  private idEcole: string;
  private dateCaisse: string;
  private statut: StatutCaisse;
  private operations: OperationCaisse[];
  private totalEncaisse: Money;
  private totalCash: Money;
  private totalMobileMoney: Money;
  private totalParCaissier: Map<string, Money>;
  private totalFondsAnticipes: Money;
  private totalFondsConsommes: Money;
  private disponibleReel: Money;
  private ouvertePar: string;
  private ouverteLe: Date;
  private clotureePar?: string;
  private clotureeLe?: Date;
  private version: number;

  constructor(proprietes: ProprietesCaisseJour) {
    super(CaisseJour.validerTexte(proprietes.idCaisseJour, 'idCaisseJour'));
    this.idEcole = CaisseJour.validerTexte(proprietes.idEcole, 'idEcole');
    this.dateCaisse = CaisseJour.validerTexte(proprietes.dateCaisse, 'dateCaisse');
    this.statut = proprietes.statut;
    this.operations = [...proprietes.operations];
    this.totalEncaisse = proprietes.totalEncaisse;
    this.totalCash = proprietes.totalCash;
    this.totalMobileMoney = proprietes.totalMobileMoney;
    this.totalParCaissier = new Map(proprietes.totalParCaissier);
    this.totalFondsAnticipes = proprietes.totalFondsAnticipes;
    this.totalFondsConsommes = proprietes.totalFondsConsommes;
    this.disponibleReel = proprietes.disponibleReel;
    this.ouvertePar = CaisseJour.validerTexte(proprietes.ouvertePar, 'ouvertePar');
    this.ouverteLe = CaisseJour.validerDate(proprietes.ouverteLe);
    this.clotureePar = CaisseJour.nettoyerTexteOptionnel(proprietes.clotureePar);
    this.clotureeLe = proprietes.clotureeLe === undefined ? undefined : CaisseJour.validerDate(proprietes.clotureeLe);
    this.version = CaisseJour.validerVersion(proprietes.version);
  }

  public static ouvrir(proprietes: Omit<ProprietesCaisseJour, 'statut' | 'operations' | 'totalEncaisse' | 'totalCash' | 'totalMobileMoney' | 'totalParCaissier' | 'totalFondsAnticipes' | 'totalFondsConsommes' | 'disponibleReel' | 'ouverteLe' | 'version'> & { ouverteLe?: Date }): CaisseJour {
    const devise = 'CDF';
    const caisse = new CaisseJour({
      ...proprietes,
      statut: StatutCaisse.OUVERTE,
      operations: [],
      totalEncaisse: Money.zero(devise),
      totalCash: Money.zero(devise),
      totalMobileMoney: Money.zero(devise),
      totalParCaissier: new Map<string, Money>(),
      totalFondsAnticipes: Money.zero(devise),
      totalFondsConsommes: Money.zero(devise),
      disponibleReel: Money.zero(devise),
      ouverteLe: proprietes.ouverteLe ?? new Date(),
      version: 1,
    });
    caisse.ajouterEvenement(new CaisseJourOuverte(caisse.obtenirId(), caisse.idEcole, caisse.ouvertePar));
    return caisse;
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirDateCaisse(): string { return this.dateCaisse; }
  public obtenirStatut(): StatutCaisse { return this.statut; }
  public obtenirOperations(): OperationCaisse[] { return [...this.operations]; }
  public obtenirTotalEncaisse(): Money { return this.totalEncaisse; }
  public obtenirTotalCash(): Money { return this.totalCash; }
  public obtenirTotalMobileMoney(): Money { return this.totalMobileMoney; }
  public obtenirTotalParCaissier(): Map<string, Money> { return new Map(this.totalParCaissier); }
  public obtenirTotalFondsAnticipes(): Money { return this.totalFondsAnticipes; }
  public obtenirTotalFondsConsommes(): Money { return this.totalFondsConsommes; }
  public obtenirDisponibleReel(): Money { return this.disponibleReel; }
  public obtenirOuvertePar(): string { return this.ouvertePar; }
  public obtenirOuverteLe(): Date { return new Date(this.ouverteLe.getTime()); }
  public obtenirClotureePar(): string | undefined { return this.clotureePar; }
  public obtenirClotureeLe(): Date | undefined { return this.clotureeLe === undefined ? undefined : new Date(this.clotureeLe.getTime()); }
  public obtenirVersion(): number { return this.version; }

  public ajouterOperation(operation: OperationCaisse): void {
    if (this.statut === StatutCaisse.CLOTUREE) {
      throw new Error('Une caisse cloturee ne peut plus recevoir d operation normale.');
    }

    this.operations.push(operation);
    this.recalculerTotaux();
    this.version += 1;
    this.ajouterEvenement(new OperationCaisseAjoutee(this.obtenirId(), operation.obtenirIdOperation(), this.idEcole));
  }

  public cloturer(clotureePar: string): void {
    if (this.statut === StatutCaisse.CLOTUREE) {
      return;
    }

    this.statut = StatutCaisse.CLOTUREE;
    this.clotureePar = CaisseJour.validerTexte(clotureePar, 'clotureePar');
    this.clotureeLe = new Date();
    this.version += 1;
    this.ajouterEvenement(new CaisseJourCloturee(this.obtenirId(), this.idEcole, this.clotureePar));
  }

  private recalculerTotaux(): void {
    const devise = this.totalEncaisse.obtenirDevise();
    this.totalEncaisse = Money.zero(devise);
    this.totalCash = Money.zero(devise);
    this.totalMobileMoney = Money.zero(devise);
    this.totalParCaissier = new Map<string, Money>();
    this.totalFondsAnticipes = Money.zero(devise);
    this.totalFondsConsommes = Money.zero(devise);

    this.operations.forEach((operation) => {
      const signe = operation.obtenirTypeOperation() === TypeOperationCaisse.RESTITUTION
        || operation.obtenirTypeOperation() === TypeOperationCaisse.ANNULATION
        || operation.obtenirTypeOperation() === TypeOperationCaisse.AJUSTEMENT_INVERSE
        ? -1
        : 1;
      const montantOperation = operation.obtenirMontant().obtenirMontant() * signe;
      const montantSigne = new Money(Math.abs(montantOperation), devise);

      this.totalEncaisse = signe === 1
        ? this.totalEncaisse.additionner(montantSigne)
        : this.totalEncaisse.soustraire(montantSigne);

      if (operation.obtenirModePaiement() === ModePaiement.CASH) {
        this.totalCash = signe === 1
          ? this.totalCash.additionner(montantSigne)
          : this.totalCash.soustraire(montantSigne);
      } else if (operation.obtenirModePaiement() === ModePaiement.MOBILE_MONEY) {
        this.totalMobileMoney = signe === 1
          ? this.totalMobileMoney.additionner(montantSigne)
          : this.totalMobileMoney.soustraire(montantSigne);
      }

      const totalCaissierCourant = this.totalParCaissier.get(operation.obtenirIdCaissier()) ?? Money.zero(devise);
      const totalCaissierMisAJour = signe === 1
        ? totalCaissierCourant.additionner(montantSigne)
        : totalCaissierCourant.soustraire(montantSigne);
      this.totalParCaissier.set(operation.obtenirIdCaissier(), totalCaissierMisAJour);
    });

    this.disponibleReel = this.totalEncaisse.soustraire(this.totalFondsAnticipes).additionner(this.totalFondsConsommes);
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
      throw new Error('La date de caisse est invalide.');
    }
    return new Date(valeur.getTime());
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new Error('La version de la caisse doit etre un entier positif.');
    }
    return version;
  }
}
