// Cette interface represente une entree d'audit applicative pour le BC.
export interface EntreeJournalAuditReferentielAcademique {
  action: string;
  acteur?: string;
  typeRessource?: string;
  idRessource?: string;
  idEcole?: string;
  idOrganisation?: string;
  details?: Readonly<Record<string, unknown>>;
  creeLe?: Date;
}

// Ce contrat definit la journalisation d'audit des actions critiques du BC.
export interface ServiceJournalAuditReferentielAcademique {
  // Cette methode persiste une entree d'audit exploitable.
  journaliser(entree: EntreeJournalAuditReferentielAcademique): Promise<void>;
}

// Cette implementation neutre preserve le comportement si aucun writer concret n'est branche.
export class ServiceJournalAuditReferentielAcademiqueSansEffet
  implements ServiceJournalAuditReferentielAcademique
{
  // Cette methode ignore volontairement l'entree d'audit.
  public async journaliser(): Promise<void> {
    return Promise.resolve();
  }
}
