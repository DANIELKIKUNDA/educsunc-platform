import { ExceptionRealtimeDomain } from './ExceptionRealtimeDomain';

export class ExceptionCanalInvalide extends ExceptionRealtimeDomain {
  public constructor(message = 'Canal temps reel invalide') {
    super(message);
    this.name = 'ExceptionCanalInvalide';
  }
}
