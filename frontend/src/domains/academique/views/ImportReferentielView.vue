<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-ACA-004"
      title="Import d un referentiel"
      description="Ecran d import brut pour les composantes officielles du referentiel academique."
    />

    <AccessBoundary capability="module.academique.access">
      <ErrorState
        v-if="!isAuthorized"
        title="Import non autorise"
        message="L import reste reserve au niveau plateforme."
      />

      <template v-else>
        <SectionBlock title="Source d import" description="Le JSON doit respecter les cles attendues par le backend.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Composante</span>
              <select v-model="typeImport">
                <option value="sections">Sections scolaires</option>
                <option value="options">Options d etude</option>
                <option value="classes">Classes academiques</option>
                <option value="cours">Cours academiques</option>
                <option value="programmes">Programmes academiques</option>
                <option value="lignes">Lignes de programme</option>
              </select>
            </label>
            <label class="academique-field academique-field--wide">
              <span>JSON source</span>
              <textarea v-model="rawJson" rows="14" placeholder='{"sections":[...]}'></textarea>
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !rawJson.trim()" @click="importer">
              Importer
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Import en cours"
          message="Validation et import de la composante officielle en cours."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Import impossible"
          :message="store.state.errorMessage ?? 'L import a echoue.'"
        />
        <SectionBlock
          v-else-if="store.state.importResult"
          title="Resultat d import"
          description="Retour brut du backend pour garder toute l information de validation utile."
        >
          <pre class="academique-json-preview">{{ formattedResult }}</pre>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
const typeImport = ref<'sections' | 'options' | 'classes' | 'cours' | 'programmes' | 'lignes'>('sections');
const rawJson = ref('');

const formattedResult = computed(() => JSON.stringify(store.state.importResult, null, 2));

const chemins: Record<typeof typeImport.value, string> = {
  sections: '/api/referentiels/import-sections',
  options: '/api/referentiels/import-options',
  classes: '/api/referentiels/import-classes',
  cours: '/api/referentiels/import-cours',
  programmes: '/api/referentiels/import-programmes',
  lignes: '/api/referentiels/import-lignes',
};

async function importer(): Promise<void> {
  try {
    const corps = JSON.parse(rawJson.value) as Record<string, unknown>;
    await store.importerReferentiel(chemins[typeImport.value], corps);
  } catch (error) {
    store.state.status = 'error';
    store.state.errorMessage = error instanceof Error ? error.message : 'L import a echoue.';
  }
}
</script>

<style scoped>
.academique-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field--wide{grid-column:1/-1}
.academique-field textarea,.academique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;font-weight:600}
.academique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
