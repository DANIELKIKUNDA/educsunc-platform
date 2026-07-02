<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-ACA-006"
      title="Migration referentielle"
      description="Analyse, application et supervision d une migration officielle de programme niveau."
    />

    <AccessBoundary page-code="ACA-MIG-001">
      <ErrorState
        v-if="!isAuthorized"
        title="Migration non autorisee"
        message="La migration referentielle reste reservee a la gouvernance plateforme autorisee."
      />

      <template v-else>
        <SectionBlock title="Analyse de migration" description="Le backend attend le programme niveau, l ancienne version et la nouvelle version.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id programme niveau</span>
              <input v-model="analyse.idProgrammeNiveau" type="text" placeholder="uuid-programme-niveau" />
            </label>
            <label class="academique-field">
              <span>Ancienne version</span>
              <input v-model="analyse.idAncienneVersionReferentiel" type="text" placeholder="uuid-version-source" />
            </label>
            <label class="academique-field">
              <span>Nouvelle version</span>
              <input v-model="analyse.idNouvelleVersionReferentiel" type="text" placeholder="uuid-version-cible" />
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canAnalyze" @click="analyser">
              Analyser
            </button>
          </div>
        </SectionBlock>

        <SectionBlock title="Supervision et mutations" description="Le meme ecran permet ensuite de consulter, lister, appliquer, annuler ou relancer.">
          <div class="academique-form-grid">
            <label class="academique-field">
              <span>Id migration</span>
              <input v-model="idMigrationInput" type="text" placeholder="uuid-migration" />
            </label>
            <label class="academique-field">
              <span>Id programme niveau pour la liste</span>
              <input v-model="idProgrammeNiveauListeInput" type="text" placeholder="uuid-programme-niveau" />
            </label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idProgrammeNiveauListeInput.trim()" @click="lister">
              Lister
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idMigrationInput.trim()" @click="consulter">
              Consulter
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idMigrationInput.trim()" @click="appliquer">
              Appliquer
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idMigrationInput.trim()" @click="annuler">
              Annuler
            </button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idMigrationInput.trim()" @click="relancer">
              Relancer recalcul
            </button>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Migration en cours"
          message="Le backend execute ou relit la migration referentielle demandee."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Migration indisponible"
          :message="store.state.errorMessage ?? 'La migration a echoue.'"
        />

        <template v-else>
          <SectionBlock
            v-if="store.state.report"
            title="Rapport de migration"
            description="Lecture directe du rapport backend de migration."
          >
            <div class="academique-kpi-grid">
              <div class="academique-kpi-card">
                <small>Migration</small>
                <strong>{{ store.state.report.migrationReferentielProgramme.id }}</strong>
                <span>{{ store.state.report.migrationReferentielProgramme.statut }}</span>
              </div>
              <div class="academique-kpi-card">
                <small>Differences</small>
                <strong>{{ store.state.report.totalDifferences }}</strong>
                <span>Transformations {{ store.state.report.totalTransformationsNotes }}</span>
              </div>
            </div>
            <pre class="academique-json-preview">{{ JSON.stringify(store.state.report, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock
            v-if="store.state.applicationResult"
            title="Application de migration"
            description="Retour combine migration + programme niveau relu."
          >
            <pre class="academique-json-preview">{{ JSON.stringify(store.state.applicationResult, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock title="Historique des migrations" description="Liste par programme niveau.">
            <EmptyState
              v-if="store.state.migrations.length === 0"
              title="Aucune migration listee"
              message="Chargez un programme niveau pour voir son historique de migrations."
            />
            <div v-else class="academique-table-shell">
              <table class="academique-table">
                <thead>
                  <tr>
                    <th>Migration</th>
                    <th>Programme niveau</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="migration in store.state.migrations" :key="migration.id">
                    <td>{{ migration.id }}</td>
                    <td>{{ migration.idProgrammeNiveau }}</td>
                    <td>{{ migration.statut }}</td>
                    <td>{{ migration.dateMigration }}</td>
                    <td>{{ migration.resumeDiff }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  type AnalyseMigrationRequest,
} from '../models/academique.model';
import { useMigrationReferentielStore } from '../stores/migration-referentiel.store';

const store = useMigrationReferentielStore();
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-MIG-001');
const idMigrationInput = ref('');
const idProgrammeNiveauListeInput = ref('');

const analyse = reactive<AnalyseMigrationRequest>({
  idProgrammeNiveau: '',
  idAncienneVersionReferentiel: '',
  idNouvelleVersionReferentiel: '',
});

const canAnalyze = computed(() =>
  analyse.idProgrammeNiveau.trim()
  && analyse.idAncienneVersionReferentiel.trim()
  && analyse.idNouvelleVersionReferentiel.trim(),
);

async function analyser(): Promise<void> {
  await store.analyser({ ...analyse });
  idMigrationInput.value = store.state.report?.migrationReferentielProgramme.id ?? '';
}

async function lister(): Promise<void> {
  await store.lister(idProgrammeNiveauListeInput.value.trim());
}

async function consulter(): Promise<void> {
  await store.consulter(idMigrationInput.value.trim());
}

async function appliquer(): Promise<void> {
  await store.appliquer(idMigrationInput.value.trim());
}

async function annuler(): Promise<void> {
  await store.annuler(idMigrationInput.value.trim());
}

async function relancer(): Promise<void> {
  await store.relancer(idMigrationInput.value.trim());
}
</script>

<style scoped>
.academique-form-grid,.academique-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action,.academique-secondary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-secondary-action{background:#fff;color:#11283f}
.academique-primary-action:disabled,.academique-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
.academique-table-shell{overflow:auto}
.academique-table{width:100%;border-collapse:collapse}
.academique-table th,.academique-table td{padding:.85rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.academique-table th{font-size:.84rem;text-transform:uppercase;color:#5e7385}
</style>
