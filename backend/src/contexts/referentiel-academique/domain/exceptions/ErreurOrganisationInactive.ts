// Cette exception de domaine signale qu'une organisation est inactive.
export class ErreurOrganisationInactive extends Error {
  // Ce constructeur initialise le message de l'erreur metier.
  constructor(message: string) {
    super(message);
    this.name = 'ErreurOrganisationInactive';
  }
}
