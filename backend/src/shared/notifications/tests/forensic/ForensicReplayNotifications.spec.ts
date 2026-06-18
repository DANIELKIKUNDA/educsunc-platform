import assert from 'node:assert/strict';
import test from 'node:test';
import { StockageReplayNotification, StockageReplayNotifications } from 'shared/notifications';

test('les historiques de replay peuvent etre consolides pour une lecture forensic', () => {
  const stockageMemoire = new StockageReplayNotification();
  const stockageHistorique = new StockageReplayNotifications();
  const entree = stockageMemoire.ouvrir('notification-1', {
    correlationId: 'corr-1',
    requestId: 'req-1',
  });
  stockageMemoire.terminer('notification-1', entree.identifiantReplay, true);

  const enregistrement = stockageHistorique.enregistrer(
    'notification-1',
    stockageMemoire.lireHistorique('notification-1'),
  );

  assert.equal(enregistrement.historiques.length, 1);
  assert.equal(enregistrement.historiques[0]?.succes, true);
});
