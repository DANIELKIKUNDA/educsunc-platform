import { TentativeConnexion } from '../../../../domain';

export interface TentativeConnexionRecord {
  id_tentative_connexion: string;
  email: string;
  adresse_ip?: string;
  user_agent?: string;
  reussie: boolean;
  raison_echec?: string;
  date_tentative: string;
}

// Ce mapper convertit une tentative de connexion entre domaine et persistance.
export class TentativeConnexionPersistenceMapper {
  public static versRecord(tentative: TentativeConnexion): TentativeConnexionRecord {
    return {
      id_tentative_connexion: tentative.obtenirId(),
      email: tentative.obtenirEmail(),
      adresse_ip: tentative.obtenirAdresseIp(),
      user_agent: tentative.obtenirUserAgent(),
      reussie: tentative.obtenirReussie(),
      raison_echec: tentative.obtenirRaisonEchec(),
      date_tentative: tentative.obtenirDateTentative().toISOString(),
    };
  }

  public static depuisRecord(record: TentativeConnexionRecord): TentativeConnexion {
    return new TentativeConnexion({
      idTentativeConnexion: record.id_tentative_connexion,
      email: record.email,
      adresseIp: record.adresse_ip,
      userAgent: record.user_agent,
      reussie: record.reussie,
      raisonEchec: record.raison_echec,
      dateTentative: new Date(record.date_tentative),
    });
  }
}
