export interface TarificationGridItem {
  id: string;
  libelle: string;
  typeFrais: string;
  section: string;
  montant: number;
  anneeScolaire: string;
  statut: 'ACTIVE' | 'INACTIVE';
  regle: string;
}

export interface TarificationViewModel {
  rows: TarificationGridItem[];
}

export const tarificationViewModel: TarificationViewModel = {
  rows: [
    {
      id: 'grille-1',
      libelle: 'Minerval Secondaire Juin',
      typeFrais: 'Minerval',
      section: 'Secondaire',
      montant: 65000,
      anneeScolaire: '2025 - 2026',
      statut: 'ACTIVE',
      regle: 'Mensuel · obligatoire',
    },
    {
      id: 'grille-2',
      libelle: 'Frais Etat Tranche 2',
      typeFrais: 'Frais Etat',
      section: 'Secondaire',
      montant: 50000,
      anneeScolaire: '2025 - 2026',
      statut: 'ACTIVE',
      regle: 'Secondaire · tranche officielle',
    },
    {
      id: 'grille-3',
      libelle: 'Atelier technique',
      typeFrais: 'Frais techniques',
      section: 'Secondaire',
      montant: 45000,
      anneeScolaire: '2025 - 2026',
      statut: 'ACTIVE',
      regle: 'Conditionne par categorie technique',
    },
    {
      id: 'grille-4',
      libelle: 'Inscription Primaire',
      typeFrais: 'Frais inscription',
      section: 'Primaire',
      montant: 80000,
      anneeScolaire: '2025 - 2026',
      statut: 'INACTIVE',
      regle: 'Unique · debut annee',
    },
  ],
};
