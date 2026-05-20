// Ce read model porte l'historique de connexion utile a la lecture.
export interface HistoriqueConnexionReadModel {
  dateConnexion: string;
  adresseIp?: string;
  deviceId?: string;
  estOffline: boolean;
}
