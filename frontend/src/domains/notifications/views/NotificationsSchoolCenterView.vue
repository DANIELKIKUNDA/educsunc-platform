<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-NOTIF-002" title="Centre local des notifications" description="Liste, detail, timeline et supervision locale des notifications de l ecole.">
      <template #actions>
        <RouterLink class="notif-pill" to="/app/notifications">
          <ArrowLeft />
          <span>Retour notifications</span>
        </RouterLink>
      </template>
    </PageHeader>

    <AccessBoundary :page-code="pageCode">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cette vue reste bornee aux acteurs locaux reellement autorises pour la lecture et le suivi."
      />

      <template v-else>
        <SectionBlock title="Filtres et pilotage" description="Le frontend relit la liste, le detail et la timeline sans inventer une logique parallele.">
          <div class="notif-toolbar">
            <label class="notif-field">
              <span>Id notification</span>
              <input v-model="notificationId" type="text" placeholder="notif-..." />
            </label>
            <label class="notif-field">
              <span>Statut</span>
              <input v-model="statut" type="text" placeholder="FAILED, SENT..." />
            </label>
            <label class="notif-field">
              <span>Type</span>
              <input v-model="type" type="text" placeholder="PAIEMENT_EFFECTUE" />
            </label>
            <label class="notif-field">
              <span>Commentaire accuse reception</span>
              <input v-model="ackComment" type="text" placeholder="Notification lue" />
            </label>
            <label class="notif-field notif-field--full">
              <span>Raison d'escalade</span>
              <input v-model="escalationReason" type="text" placeholder="Escalade vers niveau organisationnel" />
            </label>
          </div>

          <div class="notif-actions">
            <button
              v-if="canReadList"
              class="notif-pill notif-pill--action"
              type="button"
              @click="loadList"
            >
              Lister
            </button>
            <button
              v-if="canReadDetail"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="loadDetail"
            >
              Detail
            </button>
            <button
              v-if="canReadTimeline"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="loadTimeline"
            >
              Timeline
            </button>
            <button
              v-if="canReadMonitoring"
              class="notif-pill"
              type="button"
              @click="loadMonitoring"
            >
              Monitoring
            </button>
            <button
              v-if="canAcknowledge"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="acknowledge"
            >
              Accuser reception
            </button>
            <button
              v-if="canEscalate"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="escalate"
            >
              Escalader
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Notifications en cours de lecture"
          message="Le backend recharge la vue locale."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Lecture locale impossible"
          :message="store.state.errorMessage ?? 'La lecture notifications a echoue.'"
        />

        <template v-else>
          <SectionBlock title="Resume local" description="Synthese locale issue des projections relues.">
            <div class="notif-summary-grid">
              <div class="notif-card">
                <small>Liste</small>
                <strong>{{ store.state.list.length }} notification(s)</strong>
              </div>
              <div class="notif-card">
                <small>Detail</small>
                <strong>{{ resumeNotification(store.state.detail) }}</strong>
              </div>
              <div class="notif-card">
                <small>Monitoring</small>
                <strong>{{ resumeMonitoring(store.state.monitoring) }}</strong>
              </div>
              <div class="notif-card">
                <small>Timeline</small>
                <strong>{{ store.state.timeline.length }} evenement(s)</strong>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="Liste des notifications" description="Projection locale unifiee des notifications manuelles et automatiques.">
            <div class="notif-table-wrapper">
              <table class="notif-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Titre</th>
                    <th>Resume</th>
                    <th>Cree le</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in store.state.list" :key="item.identifiant">
                    <td>{{ item.identifiant }}</td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.statut }}</td>
                    <td>{{ item.titre ?? '-' }}</td>
                    <td>{{ item.messageResume }}</td>
                    <td>{{ item.creeLe }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>

          <SectionBlock v-if="store.state.detail" title="Detail notification" description="Detail stable relu depuis le backend.">
            <pre class="notif-preview">{{ store.formatJson(store.state.detail) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.timeline.length > 0" title="Timeline notification" description="Chronologie officielle de la notification cible.">
            <pre class="notif-preview">{{ store.formatJson(store.state.timeline) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.monitoring" title="Monitoring local" description="Signaux locaux de supervision des notifications d ecole.">
            <pre class="notif-preview">{{ store.formatJson(store.state.monitoring) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.lastMutation" title="Derniere mutation" description="Retour backend des mutations locales de notification.">
            <pre class="notif-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { resumeMonitoring, resumeNotification } from '../mappers/notifications.mapper';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useNotificationsStore } from '../stores/notifications.store';

const store = useNotificationsStore();
const route = useRoute();
const doctrineAccess = useDoctrineAccess();
const tenantContext = tenantContextStore.state;
const notificationId = ref(typeof route.params.idNotification === 'string' ? route.params.idNotification : '');
const statut = ref('');
const type = ref('');
const ackComment = ref('');
const escalationReason = ref('Escalade locale');
const pageCode = computed(() =>
  route.name === 'notifications-school-detail' ? 'NOTIF-ECO-005' : 'NOTIF-ECO-004',
);
const isAuthorized = computed(() => doctrineAccess.canAccessPage(pageCode.value));
const canReadList = computed(() => doctrineAccess.canUseAction('notifications.school.list.read', 'NOTIF-ECO-004'));
const canReadDetail = computed(() => doctrineAccess.canUseAction('notifications.school.detail.read', pageCode.value));
const canReadTimeline = computed(() =>
  doctrineAccess.canUseAction('notifications.school.timeline.read', 'NOTIF-ECO-004'),
);
const canReadMonitoring = computed(() =>
  doctrineAccess.canUseAction('notifications.school.monitoring.read', 'NOTIF-ECO-004'),
);
const canAcknowledge = computed(() =>
  doctrineAccess.canUseAction('notifications.school.acknowledge', 'NOTIF-ECO-004'),
);
const canEscalate = computed(() =>
  doctrineAccess.canUseAction('notifications.school.escalate', 'NOTIF-ECO-004'),
);

async function loadList(): Promise<void> {
  await store.chargerListe({
    statut: statut.value.trim() || undefined,
    type: type.value.trim() || undefined,
  });
}

async function loadDetail(): Promise<void> {
  await store.chargerDetail(notificationId.value.trim());
}

async function loadTimeline(): Promise<void> {
  await store.chargerTimeline(notificationId.value.trim());
}

async function loadMonitoring(): Promise<void> {
  await store.chargerMonitoring();
}

async function acknowledge(): Promise<void> {
  await store.accuserReception(notificationId.value.trim(), {
    acteurId: tenantContext.userId,
    commentaire: ackComment.value.trim() || undefined,
  });
}

async function escalate(): Promise<void> {
  await store.escalader(notificationId.value.trim(), {
    acteurId: tenantContext.userId,
    raison: escalationReason.value.trim() || 'Escalade locale',
  });
}
</script>

<style scoped>
.notif-toolbar,.notif-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.notif-field{display:grid;gap:.45rem}
.notif-field--full{grid-column:1/-1}
.notif-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.notif-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.notif-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.notif-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.notif-summary-grid .notif-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.notif-table-wrapper{overflow:auto}
.notif-table{width:100%;border-collapse:collapse;background:#fff;border-radius:20px;overflow:hidden}
.notif-table th,.notif-table td{padding:.85rem .9rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.notif-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
