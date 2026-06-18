export class ExceptionRealtimeDomain extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ExceptionRealtimeDomain';
  }
}
