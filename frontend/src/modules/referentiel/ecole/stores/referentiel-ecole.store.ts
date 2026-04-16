import type {
  CartePilotageReferentiel,
  ItemReferentielOfficiel,
  MessageUtilisateur,
} from '../../commun/types/referentiel.types';

export interface EtatReferentielEcole {
  nomEcole: string;
  anneeActive: string;
  messages: MessageUtilisateur[];
  cartes: CartePilotageReferentiel[];
  referentielOfficiel: ItemReferentielOfficiel[];
}

export const referentielEcoleStore: EtatReferentielEcole = {
  nomEcole: 'École courante',
  anneeActive: 'À connecter au backend',
  messages: [
    {
      titre: 'Socle prêt pour les données réelles',
      message:
        'Les indicateurs seront connectés progressivement aux données confirmées du backend, sans afficher de messages techniques aux utilisateurs.',
      ton: 'information',
    },
  ],
  cartes: [
    {
      titre: 'Années scolaires',
      statut: 'À suivre',
      description: 'Année active, préparation de la suivante et bascule annuelle dans un flux maîtrisé.',
      actionLibelle: 'Ouvrir',
    },
    {
      titre: 'Classes pédagogiques',
      statut: 'Local',
      description: 'Classes exploitées par l’école, rattachées aux classes académiques officielles.',
      actionLibelle: 'Consulter',
    },
    {
      titre: 'Programmes niveau',
      statut: 'À valider',
      description: 'Initialiser et valider les programmes locaux depuis le référentiel officiel.',
      actionLibelle: 'Vérifier',
    },
    {
      titre: 'Calendrier académique',
      statut: 'À verrouiller',
      description: 'Périodes académiques structurées avant usage dans les autres modules.',
      actionLibelle: 'Planifier',
    },
  ],
  referentielOfficiel: [
    {
      libelle: 'Classes académiques',
      valeur: 'Lecture disponible',
      statut: 'Officiel',
    },
    {
      libelle: 'Options d’études',
      valeur: 'Lecture disponible',
      statut: 'Officiel',
    },
    {
      libelle: 'Programmes officiels',
      valeur: 'Versions à consulter',
      statut: 'Officiel',
    },
  ],
};
