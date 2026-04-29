import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { PaiementAnnule } from '../events/PaiementAnnule';
import { PaiementCree } from '../events/PaiementCree';
import { PaiementReparti } from '../events/PaiementReparti';
import { PaiementRembourse } from '../events/PaiementRembourse';
import { PaiementValide } from '../events/PaiementValide';
import { RepartitionPaiement } from '../entities/RepartitionPaiement';
import { ErreurPaiementDejaAnnule } from '../exceptions/ErreurPaiementDejaAnnule';
import { Money } from '../value-objects/Money';
import { CiblePaiement } from '../value-objects/CiblePaiement';
import { ModePaiement } from '../value-objects/ModePaiement';
import { StatutPaiement } from '../value-objects/StatutPaiement';
import { TypeFrais } from '../value-objects/TypeFrais';

export interface ProprietesPaiement {
  idPaiement: string;
  idEcole: string;
  idEleve: string;
  montantTotal: Money;
  modePaiement: ModePaiement;
  typeFraisDeclare: TypeFrais;
  ciblePaiement: CiblePaiement;
  statutPaiement: StatutPaiement;
  repartitions: RepartitionPaiement[];
  creePar: string;
  creeLe: Date;
  idempotencyKey: string;
  version: number;
}

export class Paiement extends RacineAgregat<string> {
  private idEcole: string;
  private idEleve: string;
  private montantTotal: Money;
  private modePaiement: ModePaiement;
  private typeFraisDeclare: TypeFrais;
  private ciblePaiement: CiblePaiement;
  private statutPaiement: StatutPaiement;
  private repartitions: RepartitionPaiement[];
  private creePar: string;
  private creeLe: Date;
  private idempotencyKey: string;
  private version: number;

  constructor(proprietes: ProprietesPaiement) {
    super(Paiement.validerTexte(proprietes.idPaiement, 'idPaiement'));
    this.idEcole = Paiement.validerTexte(proprietes.idEcole, 'idEcole');
    this.idEleve = Paiement.validerTexte(proprietes.idEleve, 'idEleve');
    this.montantTotal = proprietes.montantTotal;
    this.modePaiement = proprietes.modePaiement;
    this.typeFraisDeclare = proprietes.typeFraisDeclare;
    this.ciblePaiement = proprietes.ciblePaiement;
    this.statutPaiement = proprietes.statutPaiement;
    this.repartitions = [...proprietes.repartitions];
    this.creePar = Paiement.validerTexte(proprietes.creePar, 'creePar');
    this.creeLe = Paiement.validerDate(proprietes.creeLe);
    this.idempotencyKey = Paiement.validerTexte(proprietes.idempotencyKey, 'idempotencyKey');
    this.version = Paiement.validerVersion(proprietes.version);
    this.verifierCoherence();
  }

  public static creer(proprietes: Omit<ProprietesPaiement, 'statutPaiement' | 'repartitions' | 'creeLe' | 'version'> & { creeLe?: Date }): Paiement {
    const paiement = new Paiement({
      ...proprietes,
      statutPaiement: StatutPaiement.ENREGISTRE,
      repartitions: [],
      creeLe: proprietes.creeLe ?? new Date(),
      version: 1,
    });
    paiement.ajouterEvenement(new PaiementCree(paiement.obtenirId(), paiement.idEcole, paiement.idEleve, paiement.creePar));
    return paiement;
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirMontantTotal(): Money { return this.montantTotal; }
  public obtenirModePaiement(): ModePaiement { return this.modePaiement; }
  public obtenirTypeFraisDeclare(): TypeFrais { return this.typeFraisDeclare; }
  public obtenirCiblePaiement(): CiblePaiement { return this.ciblePaiement; }
  public obtenirStatutPaiement(): StatutPaiement { return this.statutPaiement; }
  public obtenirRepartitions(): RepartitionPaiement[] { return [...this.repartitions]; }
  public obtenirCreePar(): string { return this.creePar; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirIdempotencyKey(): string { return this.idempotencyKey; }
  public obtenirVersion(): number { return this.version; }

  public repartir(repartitions: RepartitionPaiement[]): void {
    if (repartitions.length === 0) {
      throw new Error('Un paiement ne peut pas etre reparti sans repartition.');
    }

    const totalReparti = repartitions.reduce(
      (courant, repartition) => courant.additionner(repartition.obtenirMontantAffecte()),
      Money.zero(this.montantTotal.obtenirDevise()),
    );

    if (!totalReparti.estEgal(this.montantTotal)) {
      throw new Error('La somme des repartitions doit etre egale au montant total du paiement.');
    }

    this.repartitions = [...repartitions];
    this.statutPaiement = StatutPaiement.REPARTI;
    this.version += 1;
    this.ajouterEvenement(new PaiementReparti(this.obtenirId(), this.idEcole, this.idEleve));
  }

  public valider(): void {
    if (this.repartitions.length === 0) {
      throw new Error('Un paiement ne peut pas etre valide sans repartition.');
    }

    this.statutPaiement = StatutPaiement.VALIDE;
    this.version += 1;
    this.ajouterEvenement(new PaiementValide(this.obtenirId(), this.idEcole, this.idEleve));
  }

  public annuler(): void {
    if (this.statutPaiement === StatutPaiement.ANNULE) {
      throw new ErreurPaiementDejaAnnule();
    }

    this.statutPaiement = StatutPaiement.ANNULE;
    this.version += 1;
    this.ajouterEvenement(new PaiementAnnule(this.obtenirId(), this.idEcole, this.idEleve));
  }

  public rembourser(): void {
    this.statutPaiement = StatutPaiement.REMBOURSE;
    this.version += 1;
    this.ajouterEvenement(new PaiementRembourse(this.obtenirId(), this.idEcole, this.idEleve));
  }

  public verifierCoherence(): void {
    if (this.montantTotal.estZero()) {
      throw new Error('Le montant total d un paiement doit etre strictement positif.');
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date du paiement est invalide.');
    }
    return new Date(valeur.getTime());
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new Error('La version du paiement doit etre un entier positif.');
    }
    return version;
  }
}
