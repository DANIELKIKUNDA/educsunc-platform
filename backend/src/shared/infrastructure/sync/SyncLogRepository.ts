// Ce depot definit le contrat transverse permettant de journaliser le cycle de vie des operations de synchronisation.
export interface DepotJournalSynchronisation {
  // Cette methode enregistre le debut d'une operation et retourne l'identifiant technique du journal cree.
  enregistrerDebut(operation: string, contexte?: Record<string, any>): Promise<string>;

  // Cette methode marque le journal comme termine avec succes et permet d'y associer un resultat technique.
  enregistrerSucces(idJournal: string, resultat?: Record<string, any>): Promise<void>;

  // Cette methode marque le journal comme termine en echec avec les details disponibles.
  enregistrerEchec(idJournal: string, erreur: string, details?: Record<string, any>): Promise<void>;

  // Cette methode retourne les journaux associes a une operation donnee pour faciliter le suivi technique.
  listerParOperation(operation: string): Promise<any[]>;
}
