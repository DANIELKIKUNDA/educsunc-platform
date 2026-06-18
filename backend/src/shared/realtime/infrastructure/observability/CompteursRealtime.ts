const compteurs = {
  messagesDiffuses: 0,
  destinatairesTouches: 0,
};

export class CompteursRealtime {
  public incrementerMessages(destinataires: number): void {
    compteurs.messagesDiffuses += 1;
    compteurs.destinatairesTouches += destinataires;
  }

  public snapshot() {
    return { ...compteurs };
  }
}
