// Ce value object represente un montant monetaire dans une devise donnee.
export type DeviseMoney = 'CDF' | 'USD';

export class Money {
  private montant: number;
  private devise: DeviseMoney;

  constructor(montant: number, devise: DeviseMoney) {
    this.montant = Money.validerMontant(montant);
    this.devise = Money.validerDevise(devise);
  }

  public obtenirMontant(): number {
    return this.montant;
  }

  public obtenirDevise(): DeviseMoney {
    return this.devise;
  }

  public additionner(autre: Money): Money {
    this.verifierMemeDevise(autre);
    return new Money(this.montant + autre.obtenirMontant(), this.devise);
  }

  public soustraire(autre: Money): Money {
    this.verifierMemeDevise(autre);
    const resultat = this.montant - autre.obtenirMontant();

    if (resultat < 0) {
      throw new Error('Le resultat monetaire ne peut pas etre negatif.');
    }

    return new Money(resultat, this.devise);
  }

  public estZero(): boolean {
    return this.montant === 0;
  }

  public estSuperieurA(autre: Money): boolean {
    this.verifierMemeDevise(autre);
    return this.montant > autre.obtenirMontant();
  }

  public estSuperieurOuEgalA(autre: Money): boolean {
    this.verifierMemeDevise(autre);
    return this.montant >= autre.obtenirMontant();
  }

  public estInferieurOuEgalA(autre: Money): boolean {
    this.verifierMemeDevise(autre);
    return this.montant <= autre.obtenirMontant();
  }

  public estEgal(autre: Money): boolean {
    return this.devise === autre.obtenirDevise() && this.montant === autre.obtenirMontant();
  }

  public multiplierPar(nombre: number): Money {
    if (!Number.isInteger(nombre) || nombre < 0) {
      throw new Error('Le multiplicateur monetaire doit etre un entier positif ou nul.');
    }

    return new Money(this.montant * nombre, this.devise);
  }

  public versJSON(): { montant: number; devise: DeviseMoney } {
    return {
      montant: this.montant,
      devise: this.devise,
    };
  }

  public static zero(devise: DeviseMoney = 'CDF'): Money {
    return new Money(0, devise);
  }

  private verifierMemeDevise(autre: Money): void {
    if (this.devise !== autre.obtenirDevise()) {
      throw new Error('Les operations monetaires exigent la meme devise.');
    }
  }

  private static validerMontant(montant: number): number {
    if (!Number.isInteger(montant) || montant < 0) {
      throw new Error('Le montant doit etre un entier positif ou nul.');
    }

    return montant;
  }

  private static validerDevise(devise: DeviseMoney): DeviseMoney {
    if (devise !== 'CDF' && devise !== 'USD') {
      throw new Error('La devise du montant est invalide.');
    }

    return devise;
  }
}
