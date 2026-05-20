import { ErreurAuth } from './ErreurAuth';

// Cette erreur signale qu'aucun utilisateur AUTH n'a ete trouve.
export class ErreurUtilisateurInexistant extends ErreurAuth {
  constructor(message = 'Utilisateur auth introuvable') {
    super(message);
    this.name = 'ErreurUtilisateurInexistant';
  }
}
