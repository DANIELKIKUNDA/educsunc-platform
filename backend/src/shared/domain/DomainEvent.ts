const creerIdentifiantEvenement = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// Un evenement de domaine represente un fait important deja survenu dans le systeme.
export abstract class EvenementDomaine {
  public readonly idEvenement: string;
  public readonly dateEvenement: Date;
  public readonly typeEvenement: string;

  // Le constructeur genere l'identifiant, la date de creation et le type de l'evenement.
  constructor(typeEvenement: string) {
    this.idEvenement = creerIdentifiantEvenement();
    this.dateEvenement = new Date();
    this.typeEvenement = typeEvenement;
  }
}
