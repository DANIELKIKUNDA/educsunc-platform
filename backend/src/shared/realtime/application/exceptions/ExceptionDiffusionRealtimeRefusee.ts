import { ExceptionRealtimeApplication } from './ExceptionRealtimeApplication';

export class ExceptionDiffusionRealtimeRefusee extends ExceptionRealtimeApplication {
  public constructor(message = 'Diffusion realtime refusee') {
    super(message);
    this.name = 'ExceptionDiffusionRealtimeRefusee';
  }
}
