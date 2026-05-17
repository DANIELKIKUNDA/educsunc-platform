// Cette erreur racine represente une violation metier du BC Bulletins & Resultats.
export class ErreurMetier extends Error {
  constructor(message = 'Une regle metier du bulletin a ete violee.') {
    super(message);
    this.name = 'ErreurMetier';
  }
}
