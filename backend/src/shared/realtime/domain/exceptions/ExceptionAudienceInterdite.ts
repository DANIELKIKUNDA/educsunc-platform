import { ExceptionRealtimeDomain } from './ExceptionRealtimeDomain';

export class ExceptionAudienceInterdite extends ExceptionRealtimeDomain {
  public constructor(message = 'Audience temps reel interdite') {
    super(message);
    this.name = 'ExceptionAudienceInterdite';
  }
}
