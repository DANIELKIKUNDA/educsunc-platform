<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-NOTIF-004" title="Supervision organisationnelle" description="Archives, vue tenant, escalades et capacites consolidees de notifications.">
      <template #actions>
        <RouterLink class="notif-pill" to="/app/notifications">
          <ArrowLeft />
          <span>Retour notifications</span>
        </RouterLink>
      </template>
    </PageHeader>

    <AccessBoundary page-code="NOTIF-ORG-003">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cette vue reste bornee a la supervision organisationnelle reellement autorisee."
      />

      <template v-else>
        <SectionBlock title="Pilotage organisationnel" description="La vue consolide archives, tenant, escalades et capacites selon le perimetre organisationnel.">
          <div class="notif-toolbar">
            <label class="notif-field">
              <span>Ecole cible</span>
              <input v-model="schoolId" type="text" placeholder="ecole-..." />
            </label>
            <label class="notif-field">
              <span>Notification pour escalades</span>
              <input v-model="notificationId" type="text" placeholder="notif-..." />
            </label>
          </div>

          <div class="notif-actions">
            <button
              v-if="canReadArchives"
              class="notif-pill notif-pill--action"
              type="button"
              @click="loadArchives"
            >
              Archives
            </button>
            <button
              v-if="canReadTenant"
              class="notif-pill"
              type="button"
              @click="loadTenant"
            >
              Vue tenant
            </button>
            <button
              v-if="canReadEscalades"
              class="notif-pill"
              type="button"
              :disabled="!notificationId"
              @click="loadEscalades"
            >
              Escalades
            </button>
            <button
              v-if="canReadRealtime"
              class="notif-pill"
              type="button"
              @click="loadCapabilities"
            >
              Capacites temps reel
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Supervision en cours"
          message="Le backend relit la supervision notifications de l organisation."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Supervision indisponible"
          :message="store.state.errorMessage ?? 'La supervision notifications a echoue.'"
        />

        <template v-else>
          <SectionBlock title="Archives" description="Projection consolidee des archives notifications.">
            <pre class="notif-preview">{{ store.formatJson(store.state.archives) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.tenant" title="Vue tenant" description="Consolidation organisationnelle par tenant et ecole.">
            <pre class="notif-preview">{{ store.formatJson(store.state.tenant) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.escalades" title="Escalades" description="Historique d'escalade d'une notification relu au niveau organisationnel.">
            <pre class="notif-preview">{{ store.formatJson(store.state.escalades) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.realtime" title="Capacites temps reel" description="Capacites preparatoires temps reel exposees a l organisation.">
            <pre class="notif-preview">{{ store.formatJson(store.state.realtime) }}</pre>
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
import { useNotificationsStore } from '../stores/notifications.store';

const store = useNotificationsStore();
const doctrineAccess = useDoctrineAccess();
const schoolId = ref('');
const notificationId = ref('');
const isAuthorized = computed(() => doctrineAccess.canAccessPage('NOTIF-ORG-003'));
const canReadArchives = computed(() =>
  doctrineAccess.canUseAction('notifications.organization.archives.read', 'NOTIF-ORG-003'),
);
const canReadTenant = computed(() =>
  doctrineAccess.canUseAction('notifications.organization.tenant.read', 'NOTIF-ORG-003'),
);
const canReadEscalades = computed(() =>
  doctrineAccess.canUseAction('notifications.organization.escalations.read', 'NOTIF-ORG-003'),
);
const canReadRealtime = computed(() =>
  doctrineAccess.canUseAction('notifications.organization.realtime.read', 'NOTIF-ORG-001'),
);

async function loadArchives(): Promise<void> {
  await store.chargerArchives({
    ecoleId: schoolId.value.trim() || undefined,
  });
}

async function loadTenant(): Promise<void> {
  await store.chargerTenant({
    ecoleId: schoolId.value.trim() || undefined,
  });
}

async function loadEscalades(): Promise<void> {
  await store.chargerEscalades(notificationId.value.trim());
}

async function loadCapabilities(): Promise<void> {
  await store.chargerCapacitesRealtime();
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
