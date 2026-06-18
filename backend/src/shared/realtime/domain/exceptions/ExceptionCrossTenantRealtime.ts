import { ExceptionRealtimeDomain } from './ExceptionRealtimeDomain';

export class ExceptionCrossTenantRealtime extends ExceptionRealtimeDomain {
  public constructor(message = 'Diffusion cross-tenant interdite') {
    super(message);
    this.name = 'ExceptionCrossTenantRealtime';
  }
}
