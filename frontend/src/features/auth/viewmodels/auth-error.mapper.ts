import { ApiError } from '../../../services/api';

export interface AuthUserError {
  title: string;
  message: string;
}

export function mapAuthError(error: unknown): AuthUserError {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        title: 'Connexion au service impossible',
        message: 'Vérifiez votre connexion puis réessayez.',
      };
    }
    if (error.code === 'AUTH_INVALID' || error.status === 401) {
      return {
        title: 'Connexion impossible',
        message: "L’adresse e-mail ou le mot de passe est incorrect.",
      };
    }
    if (error.code === 'ACCOUNT_SUSPENDED' || error.code === 'ACCOUNT_DISABLED') {
      return {
        title: 'Accès indisponible',
        message: "Votre compte ne permet pas actuellement l’accès à EduSync. Contactez le responsable de votre organisation.",
      };
    }
    if (error.status === 429 || error.code === 'ACCOUNT_LOCKED') {
      return {
        title: 'Nouvelle tentative temporairement indisponible',
        message: 'Patientez quelques instants avant de réessayer.',
      };
    }
    if (error.status === 409 && error.code === 'INITIALISATION_ALREADY_COMPLETED') {
      return {
        title: 'Initialisation déjà terminée',
        message: 'EduSync est déjà prêt. Vous pouvez vous connecter.',
      };
    }
    if (error.status === 400 && error.message) {
      return { title: 'Informations à corriger', message: error.message };
    }
  }

  return {
    title: 'Une erreur est survenue',
    message: "L’action n’a pas pu être finalisée. Réessayez dans quelques instants.",
  };
}
