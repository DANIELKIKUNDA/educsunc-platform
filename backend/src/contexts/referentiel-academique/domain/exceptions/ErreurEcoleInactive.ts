// Cette exception de domaine signale qu'une ecole est inactive.
export class ErreurEcoleInactive extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurEcoleInactive';
  }
}
