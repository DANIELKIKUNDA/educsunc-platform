<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-NOTIF-001" title="Envoyer une notification locale" description="Diffusion locale ecole dans le perimetre autorise.">
      <template #actions>
        <RouterLink class="notif-pill" to="/app/notifications">
          <ArrowLeft />
          <span>Retour notifications</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Contexte" description="La diffusion reste bornee a l ecole active et aux canaux locaux autorises.">
      <div class="notif-badges">
        <ContextBadge label="Organisation" :value="context.organizationName" />
        <ContextBadge label="Ecole" :value="context.schoolName" />
        <PermissionTag :label="session.actorLabel" />
      </div>
    </SectionBlock>

    <AccessBoundary page-code="NOTIF-ECO-001">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cet ecran reste borne aux acteurs locaux reellement autorises pour l emission."
      />

      <template v-else>
        <SectionBlock title="Emission" description="Le frontend ne remodele pas la commande backend: il capture type, canaux, contenu et cibles.">
          <div class="notif-form">
            <label class="notif-field">
              <span>Type</span>
              <input v-model="form.type" type="text" placeholder="PAIEMENT_EFFECTUE" />
            </label>
            <label class="notif-field">
              <span>Titre</span>
              <input v-model="form.titre" type="text" placeholder="Paiement enregistre" />
            </label>
            <label class="notif-field notif-field--full">
              <span>Message</span>
              <textarea v-model="form.message" rows="6" placeholder="Votre message de notification"></textarea>
            </label>
            <label class="notif-field notif-field--full">
              <span>Destinataires</span>
              <input v-model="destinatairesRaw" type="text" placeholder="parent-001, eleve-002" />
            </label>
          </div>

          <div class="notif-channels">
            <label v-for="channel in channels" :key="channel" class="notif-channel">
              <input v-model="selectedChannels" :value="channel" type="checkbox" />
              <span>{{ channel }}</span>
            </label>
          </div>

          <div class="notif-actions">
            <button
              v-if="canSend"
              class="notif-pill notif-pill--action"
              type="button"
              @click="submit"
            >
              Envoyer
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Diffusion en cours"
          message="Le backend traite la notification locale."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Emission impossible"
          :message="store.state.errorMessage ?? 'La notification n a pas pu etre emise.'"
        />

        <SectionBlock v-else title="Retour backend" description="Projection brute de la mutation effectuee.">
          <pre class="notif-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type { NotificationChannel } from '../models/notifications.model';
import { useNotificationsStore } from '../stores/notifications.store';

const store = useNotificationsStore();
const doctrineAccess = useDoctrineAccess();
const context = activeContextStore.state;
const session = sessionStore.state;
const channels: readonly NotificationChannel[] = ['EMAIL', 'SMS', 'IN_APP', 'WHATSAPP', 'WEBHOOK', 'PUSH'];

const form = reactive({
  type: 'NOTIFICATION_LOCALE',
  titre: '',
  message: '',
});
const destinatairesRaw = ref('');
const selectedChannels = ref<NotificationChannel[]>(['IN_APP']);

const isAuthorized = computed(() => doctrineAccess.canAccessPage('NOTIF-ECO-001'));
const canSend = computed(() => doctrineAccess.canUseAction('notifications.school.send', 'NOTIF-ECO-001'));

async function submit(): Promise<void> {
  await store.creer({
    type: form.type.trim(),
    titre: form.titre.trim() || undefined,
    message: form.message.trim(),
    canaux: selectedChannels.value,
    destinataires: destinatairesRaw.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  });
}
</script>

<style scoped>
.notif-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.notif-field{display:grid;gap:.45rem}
.notif-field--full{grid-column:1/-1}
.notif-field input,.notif-field textarea{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.notif-badges,.notif-actions,.notif-channels{display:flex;flex-wrap:wrap;gap:.75rem}
.notif-channel{display:inline-flex;align-items:center;gap:.5rem;border-radius:999px;border:1px solid rgba(17,40,63,.12);padding:.55rem .8rem;background:#fff}
.notif-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.notif-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.notif-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
