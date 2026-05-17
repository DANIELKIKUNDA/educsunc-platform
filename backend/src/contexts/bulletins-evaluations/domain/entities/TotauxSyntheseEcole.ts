import { StatistiquesProclamationClasse, StatistiquesProclamationClasseProps } from './StatistiquesProclamationClasse';

// Cette classe porte les totaux agreges de toute l'ecole.
export class TotauxSyntheseEcole extends StatistiquesProclamationClasse {
  // Ce constructeur reutilise la meme structure que les statistiques de proclamation.
  constructor(params: StatistiquesProclamationClasseProps) {
    super(params);
  }
}
