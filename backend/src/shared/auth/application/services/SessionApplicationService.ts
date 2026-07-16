import { SessionOutput } from '../dto/output';
import { SessionCachePort } from '../ports/cache/SessionCachePort';
import { DepotRefreshToken, DepotSessionUtilisateur } from '../../domain';
import { SessionIntrouvableApplicationException } from '../exceptions';
import { SessionMapper } from '../mappers/SessionMapper';

// Ce service applicatif porte les operations transverses sur les sessions AUTH.
export class SessionApplicationService {
  constructor(
    private readonly depotSessionUtilisateur: DepotSessionUtilisateur,
    private readonly depotRefreshToken: DepotRefreshToken,
    private readonly sessionCachePort: SessionCachePort,
  ) {}

  // Cette methode charge une session active; la persistance arbitre toute revocation.
  public async obtenirSessionActive(idSessionUtilisateur: string): Promise<SessionOutput> {
    const session = await this.depotSessionUtilisateur.trouverSessionActive(idSessionUtilisateur);
    if (!session) {
      throw new SessionIntrouvableApplicationException();
    }

    const sortie = SessionMapper.depuisDomaine(session);
    await this.sessionCachePort.memoriserSession(sortie);
    return sortie;
  }

  // Cette methode revoque une session et le refresh token qui lui est rattache.
  public async revoquerSession(idSessionUtilisateur: string, raisonRevocation = 'logout'): Promise<void> {
    const session = await this.depotSessionUtilisateur.trouverParId(idSessionUtilisateur);
    if (!session) {
      throw new SessionIntrouvableApplicationException();
    }

    if (!session.obtenirRevoqueeLe()) {
      session.revoquer(raisonRevocation);
      await this.depotSessionUtilisateur.sauvegarder(session);
    }

    const refreshToken = await this.depotRefreshToken.trouverParId(session.obtenirRefreshTokenId());
    if (refreshToken && !refreshToken.obtenirRevoque()) {
      refreshToken.revoquer();
      await this.depotRefreshToken.sauvegarder(refreshToken);
    }

    await this.sessionCachePort.invaliderSession(idSessionUtilisateur);
  }

  // Cette methode met a jour le cache d'une session.
  public async memoriserSession(sortie: SessionOutput): Promise<void> {
    await this.sessionCachePort.memoriserSession(sortie);
  }
}
