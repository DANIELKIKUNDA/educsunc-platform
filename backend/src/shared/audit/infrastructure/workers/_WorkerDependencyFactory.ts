import { PostgresAuditProjectionHandler, PostgresAuditProjectionProjector } from '../persistence/postgres/projections';
import { PostgresAuditProjectionRepository } from '../persistence/postgres/repositories';

// Cette factory évite de reconstruire à la main le pipeline projection dans chaque worker.
export class WorkerDependencyFactory {
  public static creerProjectionHandler(): PostgresAuditProjectionHandler {
    return new PostgresAuditProjectionHandler(
      new PostgresAuditProjectionProjector(new PostgresAuditProjectionRepository()),
    );
  }
}
