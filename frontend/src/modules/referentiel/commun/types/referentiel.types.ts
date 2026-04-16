export type NiveauSaasReferentiel = 'plateforme' | 'organisation' | 'ecole';

export type TonMessageUtilisateur = 'information' | 'succes' | 'attention' | 'blocage';

export interface MessageUtilisateur {
  titre: string;
  message: string;
  ton: TonMessageUtilisateur;
}

export interface CartePilotageReferentiel {
  titre: string;
  statut: string;
  description: string;
  actionLibelle: string;
}

export interface ItemReferentielOfficiel {
  libelle: string;
  valeur: string;
  statut: string;
}
