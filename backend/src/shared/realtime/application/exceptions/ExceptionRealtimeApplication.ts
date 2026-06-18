export class ExceptionRealtimeApplication extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ExceptionRealtimeApplication';
  }
}
