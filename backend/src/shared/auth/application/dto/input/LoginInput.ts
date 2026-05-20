// Ce DTO transporte les donnees d'entree du cas d'usage de login.
export interface LoginInput {
  email: string;
  motDePasse: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  deviceId?: string;
  userAgent?: string;
  adresseIp?: string;
  modeOffline?: boolean;
}
