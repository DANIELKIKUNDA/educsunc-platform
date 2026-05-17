import { StatistiquesProclamationClasse } from './StatistiquesProclamationClasse';

// Cette classe represente la ligne d'une classe dans la synthese globale de l'ecole.
export class LigneSyntheseResultatsClasse {
  private idClassePedagogique: string;
  private libelleClasse: string;
  private statistiques: StatistiquesProclamationClasse;

  // Ce constructeur initialise la ligne de synthese pour une classe donnee.
  constructor(params: {
    idClassePedagogique: string;
    libelleClasse: string;
    statistiques: StatistiquesProclamationClasse;
  }) {
    this.idClassePedagogique = params.idClassePedagogique;
    this.libelleClasse = params.libelleClasse;
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

  // Cette methode expose les statistiques consolidees de la classe.
  public obtenirStatistiques(): StatistiquesProclamationClasse {
    return this.statistiques;
  }
}
