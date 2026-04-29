import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { PaiementAnnule } from '../events/PaiementAnnule';
import { OperationInverse } from '../entities/OperationInverse';

export interface ProprietesAnnulationPaiement {
  idAnnulation: string;
  idPaiement: string;
  idEcole: string;
  raison: string;
  annulePar: string;
  annuleLe: Date;
  operationsInverses: OperationInverse[];
}

export class AnnulationPaiement extends RacineAgregat<string> {
  private idPaiement: string;
  private idEcole: string;
  private raison: string;
  private annulePar: string;
  private annuleLe: Date;
  private operationsInverses: OperationInverse[];

  constructor(proprietes: ProprietesAnnulationPaiement) {
    super(AnnulationPaiement.validerTexte(proprietes.idAnnulation, 'idAnnulation'));
    this.idPaiement = AnnulationPaiement.validerTexte(proprietes.idPaiement, 'idPaiement');
    this.idEcole = AnnulationPaiement.validerTexte(proprietes.idEcole, 'idEcole');
    this.raison = AnnulationPaiement.validerTexte(proprietes.raison, 'raison');
    this.annulePar = AnnulationPaiement.validerTexte(proprietes.annulePar, 'annulePar');
    this.annuleLe = AnnulationPaiement.validerDate(proprietes.annuleLe);
    this.operationsInverses = [...proprietes.operationsInverses];
    this.ajouterEvenement(new PaiementAnnule(this.idPaiement, this.idEcole, this.annulePar));
  }

  public obtenirIdPaiement(): string { return this.idPaiement; }
  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirRaison(): string { return this.raison; }
  public obtenirAnnulePar(): string { return this.annulePar; }
  public obtenirAnnuleLe(): Date { return new Date(this.annuleLe.getTime()); }
  public obtenirOperationsInverses(): OperationInverse[] { return [...this.operationsInverses]; }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date d annulation est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
