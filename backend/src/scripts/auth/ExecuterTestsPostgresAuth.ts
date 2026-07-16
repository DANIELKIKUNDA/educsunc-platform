import '../../config/variables-environnement.config';

process.env.EDUCSYN_RUN_POSTGRES_INTEGRATION = '1';

void import('../../shared/auth/tests/infrastructure/PostgresAuthPersistence.integration.test');
void import('../../shared/auth/tests/infrastructure/PostgresAuthTokenLifecycle.integration.test');
