import { HistoriqueConnexionReadModel, ListerTentativesConnexionQuery } from '../../../../application';
import { obtenirMemoireAuthStore } from '../repositories/_memoireAuthStore';

// Cette query liste l'historique recent des tentatives et connexions AUTH.
export class ListerTentativesConnexionSQL implements ListerTentativesConnexionQuery {
  public async executer(idUtilisateur: string): Promise<readonly HistoriqueConnexionReadModel[]> {
    const store = obtenirMemoireAuthStore();
    return store.tentatives
      .filter((record) => record.email.includes(String(idUtilisateur || '').trim()))
      .map((record) => ({
        dateConnexion: record.date_tentative,
        adresseIp: record.adresse_ip,
        deviceId: undefined,
        estOffline: false,
      }));
  }
}
