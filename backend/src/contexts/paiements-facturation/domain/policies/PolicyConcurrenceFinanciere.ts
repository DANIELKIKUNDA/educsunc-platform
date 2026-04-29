// Cette policy protege les ecritures concurrentes sur une meme obligation financiere.
export class PolicyConcurrenceFinanciere {
  public verifier(versionAttendue: number, versionCourante: number): void {
    if (!Number.isInteger(versionAttendue) || versionAttendue <= 0) {
      throw new Error('La version attendue pour la concurrence doit etre un entier positif.');
    }

    if (versionAttendue !== versionCourante) {
      throw new Error('Conflit de concurrence financiere detecte.');
    }
  }
}
