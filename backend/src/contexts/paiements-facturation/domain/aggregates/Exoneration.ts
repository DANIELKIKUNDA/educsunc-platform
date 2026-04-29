import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ExonerationAccordee } from '../events/ExonerationAccordee';
import { ExonerationAnnulee } from '../events/ExonerationAnnulee';
import { Money } from '../value-objects/Money';
import { StatutExoneration } from '../value-objects/StatutExoneration';
import { TypeExoneration } from '../value-objects/TypeExoneration';

export interface ProprietesExoneration {
  idExoneration: string;
  idEcole: string;
  idEleve: string;
  idObligation: string;
  typeExoneration: TypeExoneration;
  montantExonere: Money;
  pourcentage?: number;
  raison: string;
  validePar: string;
  valideeLe: Date;
  statut: StatutExoneration;
}

export class Exoneration extends RacineAgregat<string> {
  private idEcole: string;
  private idEleve: string;
  private idObligation: string;
  private typeExoneration: TypeExoneration;
  private montantExonere: Money;
  private pourcentage?: number;
  private raison: string;
  private validePar: string;
  private valideeLe: Date;
  private statut: StatutExoneration;

  constructor(proprietes: ProprietesExoneration) {
    super(Exoneration.validerTexte(proprietes.idExoneration, 'idExoneration'));
    this.idEcole = Exoneration.validerTexte(proprietes.idEcole, 'idEcole');
    this.idEleve = Exoneration.validerTexte(proprietes.idEleve, 'idEleve');
    this.idObligation = Exoneration.validerTexte(proprietes.idObligation, 'idObligation');
    this.typeExoneration = proprietes.typeExoneration;
    this.montantExonere = proprietes.montantExonere;
    this.pourcentage = proprietes.pourcentage;
    this.raison = Exoneration.validerTexte(proprietes.raison, 'raison');
    this.validePar = Exoneration.validerTexte(proprietes.validePar, 'validePar');
    this.valideeLe = Exoneration.validerDate(proprietes.valideeLe);
    this.statut = proprietes.statut;
  }

  public static accorder(proprietes: Omit<ProprietesExoneration, 'statut' | 'valideeLe'> & { valideeLe?: Date }): Exoneration {
    const exoneration = new Exoneration({
      ...proprietes,
      valideeLe: proprietes.valideeLe ?? new Date(),
      statut: StatutExoneration.ACCORDEE,
    });
    exoneration.ajouterEvenement(new ExonerationAccordee(exoneration.obtenirId(), exoneration.idObligation, exoneration.idEcole));
    return exoneration;
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirIdObligation(): string { return this.idObligation; }
  public obtenirTypeExoneration(): TypeExoneration { return this.typeExoneration; }
  public obtenirMontantExonere(): Money { return this.montantExonere; }
  public obtenirPourcentage(): number | undefined { return this.pourcentage; }
  public obtenirRaison(): string { return this.raison; }
  public obtenirValidePar(): string { return this.validePar; }
  public obtenirValideeLe(): Date { return new Date(this.valideeLe.getTime()); }
  public obtenirStatut(): StatutExoneration { return this.statut; }

  public annuler(): void {
    this.statut = StatutExoneration.ANNULEE;
    this.ajouterEvenement(new ExonerationAnnulee(this.obtenirId(), this.idObligation, this.idEcole));
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de validation de l exoneration est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
