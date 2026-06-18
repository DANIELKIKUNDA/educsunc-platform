import { ExceptionRealtimeApplication } from './ExceptionRealtimeApplication';

export class ExceptionConnexionRealtimeIntrouvable extends ExceptionRealtimeApplication {
  public constructor(message = 'Connexion realtime introuvable') {
    super(message);
    this.name = 'ExceptionConnexionRealtimeIntrouvable';
  }
}
