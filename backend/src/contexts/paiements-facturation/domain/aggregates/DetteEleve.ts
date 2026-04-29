import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ArriereDetecte } from '../events/ArriereDetecte';
import { DetteEleveMiseAJour } from '../events/DetteEleveMiseAJour';
import { DetteAnnuelle } from '../entities/DetteAnnuelle';
import { Money } from '../value-objects/Money';

export interface ProprietesDetteEleve {
  idDetteEleve: string;
  idEleve: string;
  idEcole: string;
  dettesParAnnee: DetteAnnuelle[];
  totalArrieres: Money;
  totalAnneeActive: Money;
  totalGlobal: Money;
}

export class DetteEleve extends RacineAgregat<string> {
  private idEleve: string;
  private idEcole: string;
  private dettesParAnnee: DetteAnnuelle[];
  private totalArrieres: Money;
  private totalAnneeActive: Money;
  private totalGlobal: Money;

  constructor(proprietes: ProprietesDetteEleve) {
    super(DetteEleve.validerTexte(proprietes.idDetteEleve, 'idDetteEleve'));
    this.idEleve = DetteEleve.validerTexte(proprietes.idEleve, 'idEleve');
    this.idEcole = DetteEleve.validerTexte(proprietes.idEcole, 'idEcole');
    this.dettesParAnnee = [...proprietes.dettesParAnnee];
    this.totalArrieres = proprietes.totalArrieres;
    this.totalAnneeActive = proprietes.totalAnneeActive;
    this.totalGlobal = proprietes.totalGlobal;
    this.verifierCoherence();
  }

  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirDettesParAnnee(): DetteAnnuelle[] { return [...this.dettesParAnnee]; }
  public obtenirTotalArrieres(): Money { return this.totalArrieres; }
  public obtenirTotalAnneeActive(): Money { return this.totalAnneeActive; }
  public obtenirTotalGlobal(): Money { return this.totalGlobal; }

  public mettreAJour(dettesParAnnee: DetteAnnuelle[]): void {
    this.dettesParAnnee = [...dettesParAnnee];
    this.recalculerTotaux();
    this.ajouterEvenement(new DetteEleveMiseAJour(this.idEleve, this.idEcole));
    if (!this.totalArrieres.estZero()) {
      this.ajouterEvenement(new ArriereDetecte(this.idEleve, this.idEcole, this.dettesParAnnee.find((dette) => dette.obtenirStatutAnnee() === 'CLOTUREE')?.obtenirIdAnneeScolaire() ?? 'INCONNUE'));
    }
  }

  public verifierCoherence(): void {
    const devise = this.totalGlobal.obtenirDevise();
    const totalArrieresCalcule = this.dettesParAnnee
      .filter((dette) => dette.obtenirStatutAnnee() === 'CLOTUREE')
      .reduce((courant, dette) => courant.additionner(dette.obtenirSoldeRestant()), Money.zero(devise));
    const totalAnneeActiveCalcule = this.dettesParAnnee
      .filter((dette) => dette.obtenirStatutAnnee() === 'ACTIVE')
      .reduce((courant, dette) => courant.additionner(dette.obtenirSoldeRestant()), Money.zero(devise));
    const totalGlobalCalcule = totalArrieresCalcule.additionner(totalAnneeActiveCalcule);

    if (!this.totalArrieres.estEgal(totalArrieresCalcule)
      || !this.totalAnneeActive.estEgal(totalAnneeActiveCalcule)
      || !this.totalGlobal.estEgal(totalGlobalCalcule)) {
      throw new Error('La dette globale de l eleve est incoherente.');
    }
  }

  private recalculerTotaux(): void {
    const devise = this.totalGlobal.obtenirDevise();
    this.totalArrieres = this.dettesParAnnee
      .filter((dette) => dette.obtenirStatutAnnee() === 'CLOTUREE')
      .reduce((courant, dette) => courant.additionner(dette.obtenirSoldeRestant()), Money.zero(devise));
    this.totalAnneeActive = this.dettesParAnnee
      .filter((dette) => dette.obtenirStatutAnnee() === 'ACTIVE')
      .reduce((courant, dette) => courant.additionner(dette.obtenirSoldeRestant()), Money.zero(devise));
    this.totalGlobal = this.totalArrieres.additionner(this.totalAnneeActive);
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }
}
