<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-ACA-003"
      title="Activation d une version"
      description="Bloc de confirmation simple pour activer une version officielle deja connue."
    />

    <AccessBoundary capability="module.academique.access">
      <ErrorState
        v-if="!isAuthorized"
        title="Activation non autorisee"
        message="L activation d une version officielle reste une mutation plateforme reservee."
      />

      <template v-else>
        <SectionBlock title="Version cible" description="Le backend lit l identifiant de version dans le parametre de route HTTP.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id version referentiel</span>
              <input v-model="idVersionInput" type="text" placeholder="uuid-version-referentiel" />
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !idVersionInput.trim()" @click="activer">
              Activer la version
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Activation en cours"
          message="La version officielle est en cours d activation."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Activation impossible"
          :message="store.state.errorMessage ?? 'L activation a echoue.'"
        />
        <SectionBlock
          v-else-if="store.state.activatedVersion"
          title="Version activee"
          description="Retour de confirmation du backend."
        >
          <div class="academique-kpi-grid">
            <div class="academique-kpi-card">
              <small>Version</small>
              <strong>{{ store.state.activatedVersion.codeVersion }}</strong>
              <span>{{ store.state.activatedVersion.id }}</span>
            </div>
            <div class="academique-kpi-card">
              <small>Etat</small>
              <strong>{{ store.state.activatedVersion.active ? 'Active' : 'Inactive' }}</strong>
              <span>{{ store.state.activatedVersion.publiee ? 'Publiee' : 'Non publiee' }}</span>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { authorizedAcademiqueWriteActors } from '../models/academique.model';
import { useReferentielAdminStore } from '../stores/referentiel-admin.store';

const store = useReferentielAdminStore();
const session = sessionStore.state;
const isAuthorized = authorizedAcademiqueWriteActors.includes(session.actorCode as never);
const idVersionInput = ref('');

async function activer(): Promise<void> {
  await store.activerVersion(idVersionInput.value.trim());
}
</script>

<style scoped>
.academique-form-grid,.academique-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;font-weight:600}
.academique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
</style>
