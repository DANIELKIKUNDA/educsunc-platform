import { ExceptionRealtimeDomain } from './ExceptionRealtimeDomain';

export class ExceptionEvenementNonDiffusable extends ExceptionRealtimeDomain {
  public constructor(message = 'Evenement non diffusable') {
    super(message);
    this.name = 'ExceptionEvenementNonDiffusable';
  }
}
