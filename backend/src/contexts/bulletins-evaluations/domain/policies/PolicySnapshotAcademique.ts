// Cette policy determine les moments ou un snapshot academique doit etre produit.
export class PolicySnapshotAcademique {
  // Cette methode indique si un motif donne doit produire un snapshot.
  public doitGenererSnapshot(motif: string): boolean {
    return [
      'BULLETIN_GENERE',
      'BULLETIN_FINALISE',
      'PROCLAMATION_VALIDEE',
      'MIGRATION_APPLIQUEE',
      'ANNEE_CLOTUREE',
    ].includes(motif);
  }
}
