import {
  AuthentificationOfflineImpossibleApplicationException,
  AuthentificationImpossibleApplicationException,
  LogoutImpossibleApplicationException,
  RefreshImpossibleApplicationException,
} from '../exceptions';
import { LoginInput, RefreshTokenInput } from '../dto/input';
import { LoginOutput, RefreshTokenOutput } from '../dto/output';
import { LoginSaga } from '../sagas/LoginSaga';
import { LogoutSaga } from '../sagas/LogoutSaga';
import { OfflineAuthenticationSaga } from '../sagas/OfflineAuthenticationSaga';
import { RefreshTokenSaga } from '../sagas/RefreshTokenSaga';
import { ErreurCompteDesactive, ErreurCompteSuspendu, ErreurCompteVerrouille } from '../../domain';

// Ce service applicatif coordonne les grands parcours AUTH.
export class AuthApplicationService {
  constructor(
    private readonly loginSaga: LoginSaga,
    private readonly logoutSaga: LogoutSaga,
    private readonly refreshTokenSaga: RefreshTokenSaga,
    private readonly offlineAuthenticationSaga: OfflineAuthenticationSaga,
  ) {}

  // Cette methode coordonne un login complet.
  public async login(input: LoginInput): Promise<LoginOutput> {
    try {
      return await this.loginSaga.executer(input);
    } catch (error) {
      if (error instanceof ErreurCompteSuspendu || error instanceof ErreurCompteDesactive || error instanceof ErreurCompteVerrouille) {
        throw error;
      }
      throw new AuthentificationImpossibleApplicationException(
        'Identifiants incorrects.',
        { cause: error },
      );
    }
  }

  // Cette methode coordonne un logout complet.
  public async logout(sessionId: string): Promise<void> {
    try {
      await this.logoutSaga.executer({ sessionId });
    } catch (error) {
      throw new LogoutImpossibleApplicationException(AuthApplicationService.extraireMessage(error, 'Logout impossible'));
    }
  }

  // Cette methode coordonne une rotation de refresh token.
  public async refresh(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    try {
      return await this.refreshTokenSaga.executer(input);
    } catch (error) {
      throw new RefreshImpossibleApplicationException('La session ne peut pas etre renouvelee. Veuillez vous reconnecter.');
    }
  }

  // Cette methode coordonne une reprise d'authentification offline.
  public async authentifierOffline(utilisateurId: string, deviceId: string): Promise<void> {
    try {
      await this.offlineAuthenticationSaga.executer({ utilisateurId, deviceId });
    } catch (error) {
      throw new AuthentificationOfflineImpossibleApplicationException(AuthApplicationService.extraireMessage(error, 'Authentification offline impossible'));
    }
  }

  private static extraireMessage(error: unknown, messageParDefaut: string): string {
    return error instanceof Error && error.message ? error.message : messageParDefaut;
  }
}
