export interface EntreeJournalDiffusionRealtime {
  readonly type: string;
  readonly canal: string;
  readonly destinataires: readonly string[];
  readonly emittedAt: string;
}

const journal: EntreeJournalDiffusionRealtime[] = [];

export class JournalDiffusionRealtime {
  public enregistrer(entree: EntreeJournalDiffusionRealtime): void {
    journal.push(entree);
    if (journal.length > 500) {
      journal.splice(0, journal.length - 500);
    }
  }

  public lire(): readonly EntreeJournalDiffusionRealtime[] {
    return [...journal];
  }
}
