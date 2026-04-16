import type { MessageUtilisateur } from '../types/referentiel.types';

const messageErreurGenerique: MessageUtilisateur = {
  titre: 'Action non terminee',
  message: 'Une difficulte est survenue. Verifiez les donnees et reessayez dans quelques instants.',
  ton: 'attention',
};

// Transforme les erreurs techniques en messages utiles pour les utilisateurs.
export function traduireErreurReferentiel(erreur: unknown): MessageUtilisateur {
  if (erreur instanceof Error && erreur.message.trim().length > 0) {
    return {
      titre: 'Action non terminee',
      message: 'La demande n a pas pu aboutir. Aucune donnee n a ete perdue.',
      ton: 'attention',
    };
  }

  return messageErreurGenerique;
}
