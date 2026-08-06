const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { webcrypto } = require('node:crypto');

require('fake-indexeddb/auto');
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

const { loadTsModule } = require('./load-typescript-module.cjs');
const {
  EduSyncLocalDatabase,
  OFFLINE_DATABASE_SCHEMA_V1,
  OFFLINE_DATABASE_VERSION,
  purgeOfflineDatabase,
} = loadTsModule('src/offline/database/index.ts');
const { OfflineQueueService } = loadTsModule('src/offline/queue/queue.service.ts');
const { OfflineSyncService } = loadTsModule('src/offline/sync/sync.service.ts');
const { ApiError } = loadTsModule('src/shared/http/api.client.ts');
const { NetworkStateMachine } = loadTsModule('src/offline/network/network-state.machine.ts');
const { decryptOfflinePayload } = loadTsModule('src/offline/security/local-crypto.service.ts');
const { buildOfflinePartitionKey } = loadTsModule('src/offline/context/offline-context.ts');
const {
  assertOfflineOperationPayload,
  buildOfflineReplayRequest,
} = loadTsModule('src/offline/sync/offline-operation.contracts.ts');

function createContext(suffix = 'a') {
  return {
    partitionKey: `partition-${suffix}`,
    userId: `user-${suffix}`,
    organizationId: `organization-${suffix}`,
    schoolId: `school-${suffix}`,
    schoolYearId: `year-${suffix}`,
  };
}

function gradePayload(overrides = {}) {
  return {
    idFicheCotationEleveCours: 'fiche-1',
    codeColonne: 'P1',
    cote: 8,
    versionAttendue: 2,
    ...overrides,
  };
}

async function withDatabase(callback) {
  const database = new EduSyncLocalDatabase(`educsyn-test-${crypto.randomUUID()}`);
  try {
    await callback(database);
  } finally {
    database.close();
    await database.delete();
  }
}

test('D1.7 declare une base Dexie versionnee avec les quatre tables industrielles', async () => {
  await withDatabase(async (database) => {
    await database.open();
    assert.equal(database.verno, OFFLINE_DATABASE_VERSION);
    assert.deepEqual(
      database.tables.map((table) => table.name).sort(),
      ['conflicts', 'encryptionKeys', 'metadata', 'operations'],
    );
    assert.equal(Object.keys(OFFLINE_DATABASE_SCHEMA_V1).length, 4);
  });
});

test('D1.7 chiffre le payload et ne conserve jamais la cote en clair', async () => {
  await withDatabase(async (database) => {
    const queue = new OfflineQueueService(database, async () => createContext());
    await queue.enqueue({ operationType: 'ENCODER_COTE', payload: gradePayload() });

    const operation = await database.operations.toCollection().first();
    assert.ok(operation);
    assert.equal(operation.encryptedPayload.includes('fiche-1'), false);
    assert.equal(operation.encryptedPayload.includes('"cote":8'), false);
    const decrypted = await decryptOfflinePayload(
      database,
      operation.partitionKey,
      operation.encryptedPayload,
      operation.initializationVector,
    );
    assert.equal(JSON.stringify(decrypted), JSON.stringify(gradePayload()));
  });
});

test('D1.7 refuse les secrets avant toute ecriture locale', async () => {
  await withDatabase(async (database) => {
    const queue = new OfflineQueueService(database, async () => createContext());
    await assert.rejects(
      queue.enqueue({
        operationType: 'ENCODER_COTE',
        payload: gradePayload({ accessToken: 'secret' }),
      }),
      /secrets/i,
    );
    assert.equal(await database.operations.count(), 0);
  });
});

test('D1.7 deduplique les operations avec la meme cle idempotente', async () => {
  await withDatabase(async (database) => {
    const queue = new OfflineQueueService(database, async () => createContext());
    const first = await queue.enqueue({
      operationType: 'ENCODER_COTE',
      payload: gradePayload(),
      idempotencyKey: 'idem-1',
    });
    const second = await queue.enqueue({
      operationType: 'ENCODER_COTE',
      payload: gradePayload(),
      idempotencyKey: 'idem-1',
    });
    assert.equal(first, second);
    assert.equal(await database.operations.count(), 1);
  });
});

test('D1.7 isole cryptographiquement utilisateur, ecole et annee scolaire', async () => {
  const first = await buildOfflinePartitionKey({
    userId: 'u1', organizationId: 'o1', schoolId: 'e1', schoolYearId: 'a1',
  });
  const second = await buildOfflinePartitionKey({
    userId: 'u1', organizationId: 'o1', schoolId: 'e2', schoolYearId: 'a1',
  });
  const third = await buildOfflinePartitionKey({
    userId: 'u1', organizationId: 'o1', schoolId: 'e1', schoolYearId: 'a2',
  });
  assert.notEqual(first, second);
  assert.notEqual(first, third);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('D1.7 rejoue uniquement les contrats idempotents de cotation prouves', () => {
  const request = buildOfflineReplayRequest(
    'ENCODER_COTE',
    gradePayload(),
    { 'x-user-id': 'user-1' },
    'idem-1',
  );
  assert.equal(request.chemin, '/api/cotes');
  assert.equal(request.methode, 'POST');
  assert.equal(request.entetes['x-idempotency-key'], 'idem-1');
  assert.equal(request.entetes['x-sync-origin'], 'OFFLINE');
  assert.throws(
    () => assertOfflineOperationPayload('ENCODER_COTE', { cote: 8 }),
    /ne peut pas etre conservee/i,
  );
});

test('D1.7 ne met jamais en cache les appels API dans le service worker', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../public/sw.js'), 'utf8');
  assert.match(source, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(source, /url\.pathname\.startsWith\('\/health\/'\)/);
  assert.match(source, /request\.method !== 'GET'/);
  assert.doesNotMatch(source, /caches\.put\([^\n]*api/i);
});

test('D1.7 supprime une operation uniquement apres le succes backend reel', async () => {
  await withDatabase(async (database) => {
    const context = createContext();
    const queue = new OfflineQueueService(database, async () => context);
    await queue.enqueue({
      operationType: 'ENCODER_COTE',
      payload: gradePayload(),
      idempotencyKey: 'sync-success',
    });
    const requests = [];
    const sync = new OfflineSyncService(
      database,
      queue,
      async (request) => {
        requests.push(request);
        return { ok: true };
      },
      async () => context,
    );

    await sync.synchronize();
    assert.equal(await database.operations.count(), 0);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].entetes['x-idempotency-key'], 'sync-success');
  });
});

test('D1.7 conserve et qualifie un conflit metier sans perte du payload', async () => {
  await withDatabase(async (database) => {
    const context = createContext();
    const queue = new OfflineQueueService(database, async () => context);
    await queue.enqueue({
      operationType: 'ENCODER_COTE',
      payload: gradePayload(),
      idempotencyKey: 'sync-conflict',
    });
    const sync = new OfflineSyncService(
      database,
      queue,
      async () => {
        throw new ApiError('La fiche a ete modifiee entre-temps.', 409, 'VERSION_CONFLICT');
      },
      async () => context,
    );

    await sync.synchronize();
    const operation = await database.operations.toCollection().first();
    const conflict = await database.conflicts.toCollection().first();
    assert.equal(operation.status, 'CONFLICT');
    assert.equal(conflict.operationId, operation.id);
    assert.equal(conflict.status, 'OPEN');
  });
});

test('D1.7.1 tolere une coupure breve avant de declarer le mode hors connexion', () => {
  const machine = new NetworkStateMachine(undefined, 1_000);
  assert.equal(machine.recordFailure(1_000), 'DEGRADED');
  assert.equal(machine.recordFailure(5_000), 'DEGRADED');
  assert.equal(machine.recordFailure(10_000), 'DEGRADED');
  assert.equal(machine.recordFailure(13_000), 'OFFLINE');
});

test('D1.7.1 confirme deux fois le retour du reseau avant le replay', () => {
  const machine = new NetworkStateMachine(undefined, 1_000);
  machine.recordFailure(1_000);
  machine.recordFailure(7_000);
  machine.recordFailure(13_000);
  assert.equal(machine.state.status, 'OFFLINE');
  assert.equal(machine.recordSuccess(14_000), 'RECOVERING');
  assert.equal(machine.recordSuccess(15_000), 'ONLINE');
});

test('D1.7.1 ne rejette jamais une operation uniquement pour des coupures reseau repetees', async () => {
  await withDatabase(async (database) => {
    const context = createContext('retry');
    const queue = new OfflineQueueService(database, async () => context);
    const operationId = await queue.enqueue({
      operationType: 'ENCODER_COTE',
      payload: gradePayload(),
      idempotencyKey: 'network-retry',
    });
    const sync = new OfflineSyncService(
      database,
      queue,
      async () => {
        throw new ApiError('Connexion au serveur perdue.', 0, 'NETWORK_ERROR');
      },
      async () => context,
      () => true,
      () => undefined,
    );

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await database.operations.update(operationId, { nextAttemptAt: new Date(0).toISOString() });
      await sync.synchronize();
    }
    const operation = await database.operations.get(operationId);
    assert.equal(operation.status, 'RETRY');
    assert.equal(operation.attempts, 10);
  });
});

test('D1.7.1 refuse proprement une ecriture quand la capacite locale est insuffisante', async () => {
  await withDatabase(async (database) => {
    const queue = new OfflineQueueService(
      database,
      async () => createContext('quota'),
      async () => {
        throw new Error("L'espace hors ligne de cet appareil est presque plein.");
      },
    );
    await assert.rejects(
      queue.enqueue({ operationType: 'ENCODER_COTE', payload: gradePayload() }),
      /presque plein/i,
    );
    assert.equal(await database.operations.count(), 0);
  });
});

test('D1.7.1 purge toutes les donnees locales au changement d identite', async () => {
  const database = new EduSyncLocalDatabase(`educsyn-purge-${crypto.randomUUID()}`);
  await database.open();
  await database.metadata.add({ key: 'proof', value: 'sensitive', updatedAt: new Date().toISOString() });
  await purgeOfflineDatabase(database);
  try {
    assert.equal(await database.metadata.count(), 0);
  } finally {
    database.close();
    await database.delete();
  }
});

test('D1.7.1 conserve une projection hors ligne sans persister de jeton', () => {
  const bootstrap = fs.readFileSync(path.resolve(__dirname, '../src/shared/auth/session.bootstrap.ts'), 'utf8');
  const snapshotContract = bootstrap.match(/interface PersistedAuthSnapshot \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(snapshotContract, /effectiveProfile/);
  assert.doesNotMatch(snapshotContract, /accessToken|refreshToken/);
  assert.match(bootstrap, /restoreOfflineSnapshot/);
  assert.match(bootstrap, /isTemporaryConnectivityFailure/);
});

test('D1.7.1 expose un centre de connectivite commun au shell desktop et mobile', () => {
  const topbar = fs.readFileSync(path.resolve(__dirname, '../src/shell/components/AppTopbar.vue'), 'utf8');
  const center = fs.readFileSync(path.resolve(__dirname, '../src/shell/components/ConnectivityCenter.vue'), 'utf8');
  assert.match(topbar, /<ConnectivityCenter v-if="mobile"/);
  assert.match(topbar, /<ConnectivityCenter \/>/);
  assert.match(center, /Connexion instable/);
  assert.match(center, /session reste ouverte/);
  assert.match(center, /Opérations à vérifier/);
});
