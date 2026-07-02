<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-NOTIF-005" title="Temps reel organisationnel" description="Lecture des capacites et publication de test controlee.">
      <template #actions>
        <RouterLink class="notif-pill" to="/app/notifications">
          <ArrowLeft />
          <span>Retour notifications</span>
        </RouterLink>
      </template>
    </PageHeader>

    <AccessBoundary page-code="NOTIF-ORG-001">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cette vue reste bornee a la lecture temps reel et aux tests explicitement autorises."
      />

      <template v-else>
        <SectionBlock title="Publication de test" description="Cette vue ne remplace pas un moteur temps reel final; elle projette l'outillage preparatoire reel.">
          <div class="notif-toolbar">
            <label class="notif-field">
              <span>Canal</span>
              <input v-model="form.canal" type="text" placeholder="IN_APP" />
            </label>
            <label class="notif-field">
              <span>Sujet</span>
              <input v-model="form.sujet" type="text" placeholder="Test temps reel" />
            </label>
            <label class="notif-field notif-field--full">
              <span>Message</span>
              <textarea v-model="form.message" rows="5" placeholder="Message de test"></textarea>
            </label>
          </div>
          <div class="notif-actions">
            <button
              v-if="canReadRealtime"
              class="notif-pill"
              type="button"
              @click="loadCapabilities"
            >
              Relire capacites
            </button>
            <button
              v-if="canPublishTest"
              class="notif-pill notif-pill--action"
              type="button"
              @click="publishTest"
            >
              Publier test
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Temps reel en cours"
          message="Le backend traite la lecture ou la publication de test."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Operation temps reel impossible"
          :message="store.state.errorMessage ?? 'Le bloc temps reel a echoue.'"
        />

        <template v-else>
          <SectionBlock v-if="store.state.realtime" title="Capacites" description="Capacites temps reel preparatoires exposees au frontend.">
            <pre class="notif-preview">{{ store.formatJson(store.state.realtime) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.lastMutation" title="Retour de publication" description="Resultat brut de la publication de test.">
            <pre class="notif-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
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
const form = reactive({
  canal: 'IN_APP',
  sujet: 'Test temps reel',
  message: 'Verification de la publication temps reel preparatoire.',
});
const isAuthorized = computed(() => doctrineAccess.canAccessPage('NOTIF-ORG-001'));
const canReadRealtime = computed(() =>
  doctrineAccess.canUseAction('notifications.organization.realtime.read', 'NOTIF-ORG-001'),
);
const canPublishTest = computed(() =>
  doctrineAccess.canUseAction('notifications.organization.realtime.publish-test', 'NOTIF-ORG-001'),
);

async function loadCapabilities(): Promise<void> {
  await store.chargerCapacitesRealtime();
}

async function publishTest(): Promise<void> {
  await store.publierTestRealtime({
    canal: form.canal.trim(),
    sujet: form.sujet.trim(),
    message: form.message.trim(),
  });
}
</script>

<style scoped>
.notif-toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.notif-field{display:grid;gap:.45rem}
.notif-field--full{grid-column:1/-1}
.notif-field input,.notif-field textarea{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.notif-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.notif-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.notif-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.notif-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
