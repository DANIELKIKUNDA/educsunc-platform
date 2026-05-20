// Ce DTO transporte une demande d'authentification offline ou de reprise.
export interface AuthOfflineInput {
  utilisateurId: string;
  deviceId: string;
}
