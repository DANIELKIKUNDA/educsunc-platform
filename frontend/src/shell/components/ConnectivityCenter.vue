<template>
  <div ref="root" class="connectivity-center">
    <button
      type="button"
      class="connectivity-center__trigger"
      :class="`connectivity-center__trigger--${network.status.toLowerCase()}`"
      :aria-expanded="open"
      aria-label="Ouvrir l'état de connexion et de synchronisation"
      @click="toggle"
    >
      <Wifi v-if="network.status === 'ONLINE'" />
      <CloudCog v-else-if="network.status === 'RECOVERING'" />
      <TriangleAlert v-else-if="network.status === 'DEGRADED'" />
      <WifiOff v-else />
      <span class="connectivity-center__label">{{ statusLabel }}</span>
      <strong v-if="queue.pending + queue.conflicts + queue.rejected > 0">
        {{ queue.pending + queue.conflicts + queue.rejected }}
      </strong>
    </button>

    <section v-if="open" class="connectivity-center__panel" aria-label="État de synchronisation">
      <header>
        <span class="connectivity-center__status-icon" :data-status="network.status">
          <Wifi v-if="network.status === 'ONLINE'" />
          <CloudCog v-else-if="network.status === 'RECOVERING'" />
          <TriangleAlert v-else-if="network.status === 'DEGRADED'" />
          <WifiOff v-else />
        </span>
        <div>
          <strong>{{ statusLabel }}</strong>
          <p>{{ statusDescription }}</p>
        </div>
      </header>

      <div v-if="session.isOfflineSession" class="connectivity-center__notice">
        <ShieldCheck />
        <span>Votre session reste ouverte sur cet appareil. Les actions seront revérifiées à la reconnexion.</span>
      </div>

      <div class="connectivity-center__metrics">
        <article>
          <span>En attente</span>
          <strong>{{ queue.pending }}</strong>
        </article>
        <article>
          <span>À vérifier</span>
          <strong>{{ queue.conflicts + queue.rejected }}</strong>
        </article>
        <article>
          <span>Dernière reprise</span>
          <strong>{{ lastSynchronizationLabel }}</strong>
        </article>
      </div>

      <div v-if="storage.pressure === 'WARNING' || storage.pressure === 'CRITICAL'" class="connectivity-center__storage" role="alert">
        <HardDrive />
        <span>L'espace hors ligne de cet appareil {{ storage.pressure === 'CRITICAL' ? 'est presque plein' : 'commence à se remplir' }}.</span>
      </div>

      <div v-if="issues.length" class="connectivity-center__issues">
        <h3>Opérations à vérifier</h3>
        <article v-for="issue in issues" :key="issue.id">
          <div>
            <strong>{{ issue.operationLabel }}</strong>
            <p>{{ issue.message }}</p>
          </div>
          <div class="connectivity-center__issue-actions">
            <button type="button" @click="retryIssue(issue)">Réessayer</button>
            <button v-if="issue.status === 'CONFLICT'" type="button" class="danger" @click="discardTarget = issue.id">
              Abandonner
            </button>
          </div>
        </article>
      </div>

      <button
        type="button"
        class="connectivity-center__sync"
        :disabled="queue.synchronizing || network.status === 'OFFLINE'"
        @click="synchronizeNow"
      >
        <RefreshCw :class="{ spinning: queue.synchronizing }" />
        {{ queue.synchronizing ? 'Synchronisation en cours…' : 'Synchroniser maintenant' }}
      </button>
    </section>

    <ModalShell
      :open="Boolean(discardTarget)"
      aria-label="Abandonner une opération hors ligne"
      :busy="discarding"
      @close="discardTarget = null"
    >
      <template #header>
        <div class="connectivity-center__modal-title">
          <TriangleAlert />
          <div>
            <strong>Abandonner cette opération ?</strong>
            <p>Elle sera supprimée de cet appareil et ne sera plus envoyée au serveur.</p>
          </div>
        </div>
      </template>
      <p>Cette action est définitive. Vérifiez que les données ne doivent plus être conservées avant de continuer.</p>
      <template #footer>
        <div class="connectivity-center__modal-actions">
          <button type="button" :disabled="discarding" @click="discardTarget = null">Conserver</button>
          <button type="button" class="danger" :disabled="discarding" @click="discardIssue">Abandonner l'opération</button>
        </div>
      </template>
    </ModalShell>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  CloudCog,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Wifi,
  WifiOff,
} from 'lucide-vue-next';
import ModalShell from '../../components/communs/ModalShell.vue';
import { networkService } from '../../offline/network/network.service';
import { queueService, type OfflineQueueIssue } from '../../offline/queue/queue.service';
import { syncQueueStore } from '../../offline/queue/sync-queue.store';
import { conflictService } from '../../offline/sync/conflict.service';
import { syncService } from '../../offline/sync/sync.service';
import { storageCapacityService } from '../../offline/storage/storage-capacity.service';
import { reprendreSessionEnLigne } from '../../shared/auth/session.bootstrap';
import { sessionStore } from '../../shared/auth/session.store';
import { notificationsService } from '../../services/notifications.service';

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const issues = ref<OfflineQueueIssue[]>([]);
const discardTarget = ref<string | null>(null);
const discarding = ref(false);
const network = networkService.state;
const queue = syncQueueStore.state;
const storage = storageCapacityService.state;
const session = sessionStore.state;

const statusLabel = computed(() => ({
  ONLINE: 'En ligne',
  DEGRADED: 'Connexion instable',
  OFFLINE: 'Hors connexion',
  RECOVERING: 'Reconnexion…',
})[network.status]);

const statusDescription = computed(() => ({
  ONLINE: 'La connexion est stable et les opérations peuvent être synchronisées.',
  DEGRADED: 'EduSync vérifie la connexion avant de passer hors ligne.',
  OFFLINE: 'Vous pouvez continuer les tâches disponibles hors connexion.',
  RECOVERING: 'La connexion revient. Une seconde vérification est en cours.',
})[network.status]);

const lastSynchronizationLabel = computed(() => {
  if (!queue.lastSynchronizationAt) return 'Pas encore';
  return new Intl.DateTimeFormat('fr-CD', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(queue.lastSynchronizationAt));
});

watch(
  () => [queue.conflicts, queue.rejected, open.value],
  () => {
    if (open.value) void refreshIssues();
  },
);

onMounted(() => document.addEventListener('pointerdown', closeFromOutside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeFromOutside));

function closeFromOutside(event: PointerEvent): void {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}

function toggle(): void {
  open.value = !open.value;
  if (open.value) void refreshIssues();
}

async function refreshIssues(): Promise<void> {
  issues.value = await queueService.listIssues();
  await storageCapacityService.refresh().catch(() => undefined);
}

async function synchronizeNow(): Promise<void> {
  await networkService.probeNow();
  if (!networkService.online) {
    notificationsService.attention('Connexion encore instable', 'EduSync reprendra automatiquement dès que la connexion sera confirmée.');
    return;
  }
  const restored = await reprendreSessionEnLigne();
  if (!restored) return;
  await syncService.synchronize();
  await refreshIssues();
}

async function retryIssue(issue: OfflineQueueIssue): Promise<void> {
  if (issue.status === 'CONFLICT') await conflictService.retry(issue.id);
  else await queueService.retryRejected(issue.id);
  await synchronizeNow();
}

async function discardIssue(): Promise<void> {
  if (!discardTarget.value) return;
  discarding.value = true;
  try {
    await conflictService.discard(discardTarget.value);
    discardTarget.value = null;
    await refreshIssues();
    notificationsService.succes('Opération abandonnée', "L'opération locale a été supprimée en toute sécurité.");
  } finally {
    discarding.value = false;
  }
}
</script>

<style scoped>
.connectivity-center{position:relative}.connectivity-center__trigger{min-height:2.8rem;display:inline-flex;align-items:center;gap:.5rem;padding:.55rem .75rem;border:1px solid var(--ui-border);border-radius:.9rem;background:var(--ui-surface);color:var(--ui-text);font:inherit;font-weight:800;cursor:pointer}.connectivity-center__trigger svg{width:1.05rem}.connectivity-center__trigger strong{display:grid;min-width:1.25rem;height:1.25rem;place-items:center;border-radius:999px;background:#d9485f;color:#fff;font-size:.68rem}.connectivity-center__trigger--degraded{color:#9a5a08;background:#fff9ed}.connectivity-center__trigger--offline{color:#9f1239;background:#fff1f2}.connectivity-center__trigger--recovering{color:#1d4ed8;background:#eff6ff}.connectivity-center__panel{position:absolute;z-index:60;top:calc(100% + .8rem);right:0;width:min(27rem,calc(100vw - 1.5rem));display:grid;gap:1rem;padding:1rem;border:1px solid var(--ui-border);border-radius:1.2rem;background:var(--ui-surface);box-shadow:var(--ui-shadow-lg)}.connectivity-center__panel header{display:flex;gap:.8rem}.connectivity-center__panel header p,.connectivity-center__issues p,.connectivity-center__modal-title p{margin:.2rem 0 0;color:var(--ui-text-muted);font-size:.82rem;line-height:1.45}.connectivity-center__status-icon{display:grid;width:2.7rem;height:2.7rem;flex:0 0 auto;place-items:center;border-radius:.9rem;background:#ecfdf5;color:#047857}.connectivity-center__status-icon[data-status="DEGRADED"]{background:#fff7ed;color:#c2410c}.connectivity-center__status-icon[data-status="OFFLINE"]{background:#fff1f2;color:#be123c}.connectivity-center__status-icon[data-status="RECOVERING"]{background:#eff6ff;color:#2563eb}.connectivity-center__status-icon svg{width:1.2rem}.connectivity-center__notice,.connectivity-center__storage{display:flex;align-items:flex-start;gap:.55rem;padding:.75rem;border-radius:.85rem;background:#eff6ff;color:#1e40af;font-size:.8rem;line-height:1.45}.connectivity-center__storage{background:#fff7ed;color:#9a3412}.connectivity-center__notice svg,.connectivity-center__storage svg{width:1rem;flex:0 0 auto}.connectivity-center__metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem}.connectivity-center__metrics article{padding:.7rem;border:1px solid var(--ui-border);border-radius:.8rem;background:var(--ui-surface-subtle)}.connectivity-center__metrics span{display:block;color:var(--ui-text-muted);font-size:.68rem;font-weight:800}.connectivity-center__metrics strong{display:block;margin-top:.25rem;font-size:.88rem}.connectivity-center__issues{display:grid;gap:.5rem;max-height:15rem;overflow:auto}.connectivity-center__issues h3{margin:0;font-size:.82rem}.connectivity-center__issues article{display:flex;justify-content:space-between;gap:.65rem;padding:.7rem;border:1px solid var(--ui-border);border-radius:.8rem}.connectivity-center__issue-actions,.connectivity-center__modal-actions{display:flex;align-items:center;justify-content:flex-end;gap:.5rem}.connectivity-center__issue-actions button,.connectivity-center__modal-actions button,.connectivity-center__sync{min-height:2.4rem;padding:.48rem .7rem;border:1px solid var(--ui-border);border-radius:.75rem;background:var(--ui-surface);color:var(--ui-text);font:inherit;font-size:.75rem;font-weight:800;cursor:pointer}.connectivity-center__sync{width:100%;display:flex;align-items:center;justify-content:center;gap:.55rem;background:#123a63;color:#fff}.connectivity-center__sync:disabled{cursor:not-allowed;opacity:.55}.connectivity-center__sync svg{width:1rem}.connectivity-center .danger{border-color:#fecdd3;background:#fff1f2;color:#be123c}.connectivity-center__modal-title{display:flex;gap:.75rem}.connectivity-center__modal-title>svg{width:1.4rem;color:#be123c}.spinning{animation:connectivity-spin .8s linear infinite}@keyframes connectivity-spin{to{transform:rotate(360deg)}}
@media(max-width:760px){.connectivity-center__label{display:none}.connectivity-center__trigger{width:2.7rem;padding:0;justify-content:center}.connectivity-center__trigger strong{position:absolute;top:-.25rem;right:-.25rem}.connectivity-center__panel{position:fixed;top:4.7rem;right:.75rem;left:.75rem;width:auto;max-height:calc(100dvh - 5.5rem);overflow:auto}.connectivity-center__metrics{grid-template-columns:1fr}.connectivity-center__issues article{display:grid}}
</style>
