// Cette erreur racine porte les echecs generiques du domaine AUTH.
export class ErreurAuth extends Error {
  constructor(message = 'Erreur du domaine AUTH') {
    super(message);
    this.name = 'ErreurAuth';
  }
}
