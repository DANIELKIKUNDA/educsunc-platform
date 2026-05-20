// Cette erreur racine porte toutes les anomalies metier du module SECURITY.
export class ErreurSecurite extends Error {
  constructor(message = 'Erreur de securite') {
    super(message);
    this.name = 'ErreurSecurite';
  }
}
