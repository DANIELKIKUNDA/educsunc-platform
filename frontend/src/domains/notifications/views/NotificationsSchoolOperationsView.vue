<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-NOTIF-003" title="Operations techniques locales" description="Dead-letter, retry, replay et diagnostic local des notifications.">
      <template #actions>
        <RouterLink class="notif-pill" to="/app/notifications">
          <ArrowLeft />
          <span>Retour notifications</span>
        </RouterLink>
      </template>
    </PageHeader>

    <AccessBoundary page-code="NOTIF-ECO-002">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cet ecran reste borne a l exploitation technique locale reellement autorisee."
      />

      <template v-else>
        <SectionBlock title="Outillage technique" description="Ce bloc reste reserve a l exploitation technique locale de l ecole.">
          <div class="notif-toolbar">
            <label class="notif-field">
              <span>Id notification</span>
              <input v-model="notificationId" type="text" placeholder="notif-..." />
            </label>
            <label class="notif-field">
              <span>Raison</span>
              <input v-model="reason" type="text" placeholder="Reprise technique controlee" />
            </label>
          </div>
          <div class="notif-actions">
            <button
              v-if="canReadDeadLetter"
              class="notif-pill notif-pill--action"
              type="button"
              @click="loadDeadLetter"
            >
              Dead-letter
            </button>
            <button
              v-if="canRetry"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="runRetry"
            >
              Retry
            </button>
            <button
              v-if="canRetry"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="loadRetries"
            >
              Historique retry
            </button>
            <button
              v-if="canReplay"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="runReplay"
            >
              Replay
            </button>
            <button
              v-if="canReplay"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="loadReplayDiagnostic"
            >
              Diagnostic replay
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Operation technique en cours"
          message="Le backend traite l operation locale de notification."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Operation impossible"
          :message="store.state.errorMessage ?? 'L operation technique notifications a echoue.'"
        />

        <template v-else>
          <SectionBlock title="Dead-letter" description="Projection des notifications locales en echec durable.">
            <pre class="notif-preview">{{ store.formatJson(store.state.deadLetters) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.retries.length > 0" title="Historique retry" description="Historique officiel des retries de la notification cible.">
            <pre class="notif-preview">{{ store.formatJson(store.state.retries) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.replayDiagnostic" title="Diagnostic replay" description="Diagnostic de rejeu relu depuis le backend.">
            <pre class="notif-preview">{{ store.formatJson(store.state.replayDiagnostic) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.lastMutation" title="Derniere mutation technique" description="Retour brut de l operation retry ou replay.">
            <pre class="notif-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useNotificationsStore } from '../stores/notifications.store';

const store = useNotificationsStore();
const doctrineAccess = useDoctrineAccess();
const tenantContext = tenantContextStore.state;
const notificationId = ref('');
const reason = ref('Reprise technique');
const isAuthorized = computed(() => doctrineAccess.canAccessPage('NOTIF-ECO-002'));
const canReadDeadLetter = computed(() =>
  doctrineAccess.canUseAction('notifications.school.dead-letter.read', 'NOTIF-ECO-002'),
);
const canRetry = computed(() => doctrineAccess.canUseAction('notifications.school.retry', 'NOTIF-ECO-002'));
const canReplay = computed(() => doctrineAccess.canUseAction('notifications.school.replay', 'NOTIF-ECO-002'));

async function loadDeadLetter(): Promise<void> {
  await store.chargerDeadLetter();
}

async function runRetry(): Promise<void> {
  await store.executerRetry(notificationId.value.trim(), {
    acteurId: tenantContext.userId,
    raison: reason.value.trim() || undefined,
  });
}

async function loadRetries(): Promise<void> {
  await store.chargerRetries(notificationId.value.trim());
}

async function runReplay(): Promise<void> {
  await store.executerReplay(notificationId.value.trim(), {
    acteurId: tenantContext.userId,
    raison: reason.value.trim() || undefined,
    reinitialiserCompteurs: true,
  });
}

async function loadReplayDiagnostic(): Promise<void> {
  await store.chargerDiagnosticReplay(notificationId.value.trim());
}
</script>

<style scoped>
.notif-toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.notif-field{display:grid;gap:.45rem}
.notif-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.notif-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.notif-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.notif-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.notif-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
