import type { AuditWorkerRetryDto } from '../dto';
export class AuditWorkersRetryInterface {
  public static creer(): AuditWorkerRetryDto {
    return { retryLimit: 10, retryWindow: 'PT1H', retryBackoff: 'EXPONENTIAL' };
  }
}

