import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ExcedentRestitue } from '../events/ExcedentRestitue';
import { Money } from '../value-objects/Money';

export interface ProprietesRestitution {
  idRestitution: string;
  idPaiement: string;
  idEcole: string;
  idEleve: string;
  montant: Money;
  raison: 'EXCEDENT';
  effectuePar: string;
  effectueLe: Date;
}

export class Restitution extends RacineAgregat<string> {
  private idPaiement: string;
  private idEcole: string;
  private idEleve: string;
  private montant: Money;
  private raison: 'EXCEDENT';
  private effectuePar: string;
  private effectueLe: Date;

  constructor(proprietes: ProprietesRestitution) {
    super(Restitution.validerTexte(proprietes.idRestitution, 'idRestitution'));
    this.idPaiement = Restitution.validerTexte(proprietes.idPaiement, 'idPaiement');
    this.idEcole = Restitution.validerTexte(proprietes.idEcole, 'idEcole');
    this.idEleve = Restitution.validerTexte(proprietes.idEleve, 'idEleve');
    this.montant = proprietes.montant;
    this.raison = proprietes.raison;
    this.effectuePar = Restitution.validerTexte(proprietes.effectuePar, 'effectuePar');
    this.effectueLe = Restitution.validerDate(proprietes.effectueLe);
    this.ajouterEvenement(new ExcedentRestitue(this.obtenirId(), this.idPaiement, this.idEcole));
  }

  public obtenirIdPaiement(): string { return this.idPaiement; }
  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirMontant(): Money { return this.montant; }
  public obtenirRaison(): 'EXCEDENT' { return this.raison; }
  public obtenirEffectuePar(): string { return this.effectuePar; }
  public obtenirEffectueLe(): Date { return new Date(this.effectueLe.getTime()); }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de restitution est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
