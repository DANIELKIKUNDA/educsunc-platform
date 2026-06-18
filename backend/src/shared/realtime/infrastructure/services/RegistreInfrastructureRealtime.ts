import {
  AdaptateurAuthRealtimeLocal,
  AdaptateurConfigurationRealtimeLocal,
  AdaptateurSecurityRealtimeLocal,
  CollecteurObservabiliteRealtime,
  DiffuseurRealtimeMemoire,
  RepositoryAbonnementRealtimeMemoire,
  RepositoryConnexionRealtimeMemoire,
  RepositoryEvenementRealtimeMemoire,
  ResolveurAudienceRealtimeLocal,
} from '..';

export class RegistreInfrastructureRealtime {
  public readonly connexions = new RepositoryConnexionRealtimeMemoire();
  public readonly abonnements = new RepositoryAbonnementRealtimeMemoire();
  public readonly evenements = new RepositoryEvenementRealtimeMemoire();
  public readonly diffusion = new DiffuseurRealtimeMemoire();
  public readonly audience = new ResolveurAudienceRealtimeLocal();
  public readonly auth = new AdaptateurAuthRealtimeLocal();
  public readonly security = new AdaptateurSecurityRealtimeLocal();
  public readonly configuration = new AdaptateurConfigurationRealtimeLocal();
  public readonly observabilite = new CollecteurObservabiliteRealtime();
}
