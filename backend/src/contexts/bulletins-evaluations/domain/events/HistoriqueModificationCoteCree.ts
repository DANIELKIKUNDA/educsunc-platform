import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement signale qu'une modification de cote vient d'etre tracee.
export class HistoriqueModificationCoteCree extends EvenementDomaine {
  public readonly idHistoriqueModificationCote: string;
  public readonly idFicheCotationEleveCours: string;
  public readonly idEleve: string;
  public readonly idReferentielCours: string;
  public readonly codeColonne: string;
  public readonly ancienneCote: number | null;
  public readonly nouvelleCote: number | null;
  public readonly modifiePar: string;
  public readonly dateModification: Date;

  constructor(params: {
    idHistoriqueModificationCote: string;
    idFicheCotationEleveCours: string;
    idEleve: string;
    idReferentielCours: string;
    codeColonne: string;
    ancienneCote: number | null;
    nouvelleCote: number | null;
    modifiePar: string;
    dateModification: Date;
  }) {
    super('HistoriqueModificationCoteCree');
    this.idHistoriqueModificationCote = params.idHistoriqueModificationCote;
    this.idFicheCotationEleveCours = params.idFicheCotationEleveCours;
    this.idEleve = params.idEleve;
    this.idReferentielCours = params.idReferentielCours;
    this.codeColonne = params.codeColonne;
    this.ancienneCote = params.ancienneCote;
    this.nouvelleCote = params.nouvelleCote;
    this.modifiePar = params.modifiePar;
    this.dateModification = params.dateModification;
  }
}
