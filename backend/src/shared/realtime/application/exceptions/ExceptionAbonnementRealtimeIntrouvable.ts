import { ExceptionRealtimeApplication } from './ExceptionRealtimeApplication';

export class ExceptionAbonnementRealtimeIntrouvable extends ExceptionRealtimeApplication {
  public constructor(message = 'Abonnement realtime introuvable') {
    super(message);
    this.name = 'ExceptionAbonnementRealtimeIntrouvable';
  }
}
