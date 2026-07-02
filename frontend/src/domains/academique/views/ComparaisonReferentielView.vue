<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-ACA-005"
      title="Comparaison de versions"
      description="Analyse plateforme de deux versions de referentiel sans recalcul frontend parallele."
    />

    <AccessBoundary page-code="ACA-CMP-001">
      <ErrorState
        v-if="!isAuthorized"
        title="Comparaison non autorisee"
        message="Cette analyse academique reste reservee au pilotage plateforme."
      />

      <template v-else>
        <SectionBlock title="Versions a comparer" description="Les trois champs sont obligatoires selon le validateur backend.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id classe academique</span>
              <input v-model="demande.idClasseAcademique" type="text" placeholder="uuid-classe-academique" />
            </label>
            <label class="academique-field">
              <span>Version source</span>
              <input v-model="demande.versionReferentielSource" type="text" placeholder="version-source" />
            </label>
            <label class="academique-field">
              <span>Version cible</span>
              <input v-model="demande.versionReferentielCible" type="text" placeholder="version-cible" />
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canSubmit" @click="comparer">
              Comparer
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Comparaison en cours"
          message="Le backend calcule les differences entre les deux versions."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Comparaison indisponible"
          :message="store.state.errorMessage ?? 'La comparaison a echoue.'"
        />
        <SectionBlock
          v-else-if="store.state.comparisonReport"
          title="Rapport compare"
          description="Le frontend expose le resultat backend sans reinterpretation."
        >
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.comparisonReport, null, 2) }}</pre>
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
  type ComparaisonReferentielRequest,
} from '../models/academique.model';
import { useReferentielAdminStore } from '../stores/referentiel-admin.store';

const store = useReferentielAdminStore();
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-CMP-001');

const demande = reactive<ComparaisonReferentielRequest>({
  idClasseAcademique: '',
  versionReferentielSource: '',
  versionReferentielCible: '',
});

const canSubmit = computed(() =>
  Boolean(
    demande.idClasseAcademique.trim()
    && demande.versionReferentielSource.trim()
    && demande.versionReferentielCible.trim(),
  ),
);

async function comparer(): Promise<void> {
  await store.comparerVersions({ ...demande });
}
</script>

<style scoped>
.academique-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;font-weight:600}
.academique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
