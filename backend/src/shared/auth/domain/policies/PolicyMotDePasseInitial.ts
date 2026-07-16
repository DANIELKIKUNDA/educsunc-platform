// Cette policy centralise les exigences minimales du premier mot de passe de gouvernance.
export class PolicyMotDePasseInitial {
  public static verifier(motDePasse: string): void {
    const valeur = String(motDePasse || '');
    if (valeur.length < 12) {
      throw new Error('Le mot de passe doit contenir au moins 12 caracteres.');
    }
    if (!/[a-z]/.test(valeur) || !/[A-Z]/.test(valeur) || !/[0-9]/.test(valeur)) {
      throw new Error('Le mot de passe doit contenir une minuscule, une majuscule et un chiffre.');
    }
  }
}
