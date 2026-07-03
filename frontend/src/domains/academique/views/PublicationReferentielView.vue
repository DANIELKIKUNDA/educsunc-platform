<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-ACA-002"
      title="Publication d un referentiel"
      description="Action plateforme de publication officielle d une version de referentiel academique."
    />

    <AccessBoundary :page-code="currentPageCode">
      <ErrorState
        v-if="!isAuthorized"
        title="Publication non autorisee"
        message="Seuls MANAGER_SYSTEME et OPERATEUR_SYSTEME peuvent publier une version officielle."
      />

      <template v-else>
        <SectionBlock title="Formulaire de publication" description="Les champs suivent exactement le validateur backend.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id referentiel programme</span>
              <input v-model="demande.idReferentielProgramme" type="text" placeholder="uuid-referentiel" />
            </label>
            <label class="academique-field">
              <span>Code version</span>
              <input v-model="demande.codeVersion" type="text" placeholder="v2026.1" />
            </label>
            <label class="academique-field">
              <span>Annee reference</span>
              <input v-model="demande.anneeReference" type="text" placeholder="2026" />
            </label>
            <label class="academique-field">
              <span>Date publication</span>
              <input v-model="demande.datePublication" type="date" />
            </label>
            <label class="academique-field">
              <span>Source import</span>
              <input v-model="demande.sourceImport" type="text" placeholder="MINEDU_NORME_OFFICIELLE" />
            </label>
            <label class="academique-field">
              <span>Motif publication</span>
              <textarea v-model="demande.motifPublication" rows="3" placeholder="Motif facultatif"></textarea>
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canSubmit" @click="publier">
              Publier la version
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Publication en cours"
          message="La version officielle est en cours de publication."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Publication impossible"
          :message="store.state.errorMessage ?? 'La publication a echoue.'"
        />
        <SectionBlock
          v-else-if="store.state.publishedVersion"
          title="Version publiee"
          description="Projection directe retour backend."
        >
          <div class="academique-kpi-grid">
            <div class="academique-kpi-card">
              <small>Version</small>
              <strong>{{ store.state.publishedVersion.codeVersion }}</strong>
              <span>{{ store.state.publishedVersion.id }}</span>
            </div>
            <div class="academique-kpi-card">
              <small>Annee</small>
              <strong>{{ store.state.publishedVersion.anneeReference }}</strong>
              <span>{{ store.state.publishedVersion.datePublication }}</span>
            </div>
            <div class="academique-kpi-card">
              <small>Statut</small>
              <strong>{{ store.state.publishedVersion.publiee ? 'Publiee' : 'Non publiee' }}</strong>
              <span>{{ store.state.publishedVersion.active ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  type PublicationReferentielRequest,
} from '../models/academique.model';
import { useReferentielAdminStore } from '../stores/referentiel-admin.store';

const store = useReferentielAdminStore();
const doctrineAccess = useDoctrineAccess();
const currentPageCode = computed(() => {
  const code = doctrineAccess.currentPage.value?.code;
  return typeof code === 'string' ? code : undefined;
});
const isAuthorized = computed(() => currentPageCode.value ? doctrineAccess.canAccessPage(currentPageCode.value) : false);

const demande = reactive<PublicationReferentielRequest>({
  idReferentielProgramme: '',
  codeVersion: '',
  anneeReference: '',
  datePublication: '',
  sourceImport: '',
  motifPublication: '',
});

const canSubmit = computed(() =>
  demande.idReferentielProgramme.trim()
  && demande.codeVersion.trim()
  && demande.anneeReference.trim()
  && demande.datePublication.trim()
  && demande.sourceImport.trim(),
);

async function publier(): Promise<void> {
  await store.publierVersion({
    ...demande,
    motifPublication: demande.motifPublication?.trim() || undefined,
  });
}
</script>

<style scoped>
.academique-form-grid,.academique-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input,.academique-field textarea{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;font-weight:600}
.academique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
</style>
