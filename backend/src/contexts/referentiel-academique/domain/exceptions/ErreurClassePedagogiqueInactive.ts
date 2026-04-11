// Cette exception de domaine signale qu'une classe pedagogique est inactive.
export class ErreurClassePedagogiqueInactive extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurClassePedagogiqueInactive';
  }
}
