import { Entite } from '../../../../shared/domain/Entity';
import { ErreurCoteInvalide } from '../exceptions/ErreurCoteInvalide';

// Cette entite trace une modification de cote de maniere immutable et audit-able.
export class HistoriqueModificationCote extends Entite<string> {
  private idFicheCotationEleveCours: string;
  private idEleve: string;
  private idReferentielCours: string;
  private codeColonne: string;
  private ancienneCote: number | null;
  private nouvelleCote: number | null;
  private ancienMaximum: number | null;
  private nouveauMaximum: number | null;
  private modifiePar: string;
  private dateModification: Date;
  private motifModification?: string;
  private versionAvant: number;
  private versionApres: number;

  // Ce constructeur fige completement une modification de cote.
  constructor(params: {
    idHistoriqueModificationCote: string;
    idFicheCotationEleveCours: string;
    idEleve: string;
    idReferentielCours: string;
    codeColonne: string;
    ancienneCote: number | null;
    nouvelleCote: number | null;
    ancienMaximum: number | null;
    nouveauMaximum: number | null;
    modifiePar: string;
    dateModification: Date;
    motifModification?: string;
    versionAvant: number;
    versionApres: number;
  }) {
    super(params.idHistoriqueModificationCote);
    this.idFicheCotationEleveCours = params.idFicheCotationEleveCours;
    this.idEleve = params.idEleve;
    this.idReferentielCours = params.idReferentielCours;
    this.codeColonne = params.codeColonne;
    this.ancienneCote = this.validerCote(params.ancienneCote);
    this.nouvelleCote = this.validerCote(params.nouvelleCote);
    this.ancienMaximum = this.validerEntierOuNull(params.ancienMaximum, 'ancienMaximum');
    this.nouveauMaximum = this.validerEntierOuNull(params.nouveauMaximum, 'nouveauMaximum');
    this.modifiePar = params.modifiePar;
    this.dateModification = new Date(params.dateModification.getTime());
    this.motifModification = params.motifModification;
    this.versionAvant = params.versionAvant;
    this.versionApres = params.versionApres;
  }

  public obtenirIdFicheCotationEleveCours(): string { return this.idFicheCotationEleveCours; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirIdReferentielCours(): string { return this.idReferentielCours; }
  public obtenirCodeColonne(): string { return this.codeColonne; }
  public obtenirAncienneCote(): number | null { return this.ancienneCote; }
  public obtenirNouvelleCote(): number | null { return this.nouvelleCote; }
  public obtenirAncienMaximum(): number | null { return this.ancienMaximum; }
  public obtenirNouveauMaximum(): number | null { return this.nouveauMaximum; }
  public obtenirModifiePar(): string { return this.modifiePar; }
  public obtenirDateModification(): Date { return new Date(this.dateModification.getTime()); }
  public obtenirMotifModification(): string | undefined { return this.motifModification; }
  public obtenirVersionAvant(): number { return this.versionAvant; }
  public obtenirVersionApres(): number { return this.versionApres; }

  // Cette methode verifie qu'une cote reste entiere ou absente.
  private validerCote(valeur: number | null): number | null {
    return this.validerEntierOuNull(valeur, 'cote');
  }

  // Cette methode verifie qu'une valeur numerique reste entiere quand elle est presente.
  private validerEntierOuNull(valeur: number | null, nomChamp: string): number | null {
    if (valeur === null) {
      return null;
    }

    if (!Number.isInteger(valeur)) {
      throw new ErreurCoteInvalide(`Le champ ${nomChamp} doit etre un entier ou null.`);
    }

    return valeur;
  }
}
