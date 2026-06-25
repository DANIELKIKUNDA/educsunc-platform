import { StatistiquesProclamationClasse } from './StatistiquesProclamationClasse';

// Cette classe represente la ligne d'une classe dans la synthese globale de l'ecole.
export class LigneSyntheseResultatsClasse {
  private idClassePedagogique: string;
  private libelleClasse: string;
  private idSectionScolaire?: string;
  private sectionCode?: string;
  private sectionLibelle?: string;
  private statistiques: StatistiquesProclamationClasse;

  // Ce constructeur initialise la ligne de synthese pour une classe donnee.
  constructor(params: {
    idClassePedagogique: string;
    libelleClasse: string;
    idSectionScolaire?: string;
    sectionCode?: string;
    sectionLibelle?: string;
    statistiques: StatistiquesProclamationClasse;
  }) {
    this.idClassePedagogique = params.idClassePedagogique;
    this.libelleClasse = params.libelleClasse;
    this.idSectionScolaire = params.idSectionScolaire;
    this.sectionCode = params.sectionCode;
    this.sectionLibelle = params.sectionLibelle;
    this.statistiques = params.statistiques;
  }

  // Cette methode expose l'identifiant de la classe pedagogique.
  public obtenirIdClassePedagogique(): string {
    return this.idClassePedagogique;
  }

  // Cette methode expose le libelle de la classe.
  public obtenirLibelleClasse(): string {
    return this.libelleClasse;
  }

  // Cette methode expose l'identifiant de section si il est disponible.
  public obtenirIdSectionScolaire(): string | undefined {
    return this.idSectionScolaire;
  }

  // Cette methode expose le code de section si il est disponible.
  public obtenirSectionCode(): string | undefined {
    return this.sectionCode;
  }

  // Cette methode expose le libelle de section si il est disponible.
  public obtenirSectionLibelle(): string | undefined {
    return this.sectionLibelle;
  }

  // Cette methode expose les statistiques consolidees de la classe.
  public obtenirStatistiques(): StatistiquesProclamationClasse {
    return this.statistiques;
  }
}
