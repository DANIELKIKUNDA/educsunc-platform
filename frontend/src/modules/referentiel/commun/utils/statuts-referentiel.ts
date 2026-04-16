export function libellerStatutReferentiel(statut: string): string {
  const statuts: Record<string, string> = {
    ACTIVE: 'Active',
    PLANIFIEE: 'Planifiee',
    CLOTUREE: 'Cloturee',
    ARCHIVEE: 'Archivee',
    BROUILLON: 'Brouillon',
    VALIDE: 'Valide',
    VERROUILLE: 'Verrouille',
  };

  return statuts[statut] ?? statut;
}
