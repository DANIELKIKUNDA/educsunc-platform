export class ServiceGenerationNumeroRecu {
  public generer(dateReference: Date, sequence: number): string {
    const annee = dateReference.getFullYear();
    const sequenceFormatee = String(sequence).padStart(6, '0');
    return `REC-${annee}-${sequenceFormatee}`;
  }
}
