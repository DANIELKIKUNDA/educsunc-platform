import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';

import { installerArretGracieux } from '../lifecycle/arret-gracieux';

class FauxProcessus extends EventEmitter {
  public exitCode?: number;
}

test('SIGTERM ferme le serveur une seule fois et libere les ecouteurs', async () => {
  const processus = new FauxProcessus();
  let fermetures = 0;
  const serveur = {
    close: async () => {
      fermetures += 1;
    },
    log: {
      error: () => undefined,
      info: () => undefined,
    },
  };
  const controle = installerArretGracieux(serveur, processus);

  processus.emit('SIGTERM');
  await controle.arreter('SIGTERM');

  assert.equal(fermetures, 1);
  assert.equal(processus.listenerCount('SIGINT'), 0);
  assert.equal(processus.listenerCount('SIGTERM'), 0);
  assert.equal(processus.exitCode, undefined);
});

test("un echec de fermeture fixe un code d'echec sans rejet non gere", async () => {
  const processus = new FauxProcessus();
  const serveur = {
    close: async () => {
      throw new Error('fermeture impossible');
    },
    log: {
      error: () => undefined,
      info: () => undefined,
    },
  };
  const controle = installerArretGracieux(serveur, processus);

  await controle.arreter('SIGINT');

  assert.equal(processus.exitCode, 1);
});
