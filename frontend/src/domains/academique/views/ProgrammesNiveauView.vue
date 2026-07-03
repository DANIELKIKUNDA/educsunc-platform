<template>
  <PageContainer>
    <PageHeader eyebrow="ACA-07" title="Programmes niveau" description="Initialisation, consultation, validation, archivage et etat local du programme-niveau." />
    <AccessBoundary page-code="ACA-LOC-005">
      <ErrorState v-if="!isAuthorized" title="Acces non autorise" message="Cette vue locale academique reste reservee a l administrateur systeme ecole." />
      <template v-else>
        <SectionBlock title="Initialisation locale" description="Le programme-niveau est derive d un referentiel programme et d une version officielle.">
          <div class="academique-context-strip">
            <div class="academique-context-chip">
              <small>Id ecole actif</small>
              <strong>{{ tenantContext.schoolId }}</strong>
            </div>
            <div class="academique-context-chip">
              <small>Annee scolaire active</small>
              <strong>{{ activeContext.schoolYearLabel || 'A charger via ACA-03' }}</strong>
            </div>
            <div class="academique-context-chip">
              <small>Id annee active</small>
              <strong>{{ activeContext.schoolYearId || 'Non resolu' }}</strong>
            </div>
            <div class="academique-context-chip">
              <small>Utilisateur trace</small>
              <strong>{{ tenantContext.userId }}</strong>
            </div>
          </div>
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id classe academique</span><input v-model="initialisation.idClasseAcademique" type="text" /></label>
            <label class="academique-field"><span>Id referentiel programme</span><input v-model="initialisation.idReferentielProgramme" type="text" /></label>
            <label class="academique-field"><span>Id version referentiel</span><input v-model="initialisation.idVersionReferentielProgramme" type="text" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canInitialize" @click="initialiser">Initialiser</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasActiveScope" @click="lister">Lister</button>
          </div>
        </SectionBlock>

        <SectionBlock title="Programme cible" description="Le detail, l etat local, la validation et l archivage se font sur un identifiant de programme-niveau reel.">
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id programme niveau</span><input v-model="idProgrammeNiveauInput" type="text" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idProgrammeNiveauInput.trim()" @click="consulter">Consulter</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idProgrammeNiveauInput.trim()" @click="etatLocal">Etat local</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idProgrammeNiveauInput.trim() || !tenantContext.userId.trim()" @click="valider">Valider</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idProgrammeNiveauInput.trim() || !tenantContext.userId.trim()" @click="archiver">Archiver</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Programme niveau" message="Lecture ou mutation du programme niveau local en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Operation impossible" :message="store.state.errorMessage ?? 'Operation impossible.'" />

        <SectionBlock v-if="store.state.programme" title="Programme charge" description="Projection backend du programme-niveau local.">
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.programme, null, 2) }}</pre>
        </SectionBlock>
        <SectionBlock v-if="store.state.etatProgramme" title="Etat local du programme" description="Projection consolidee exploitable par les workflows aval.">
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.etatProgramme, null, 2) }}</pre>
        </SectionBlock>
        <SectionBlock title="Programmes listes" description="Historique pagine des programmes-niveau pour l ecole et l annee.">
          <EmptyState v-if="store.state.entries.length === 0" title="Aucun programme charge" message="Chargez la liste pour voir les programmes niveau disponibles." />
          <div v-else class="academique-table-shell">
            <table class="academique-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Classe academique</th>
                  <th>Version</th>
                  <th>Statut</th>
                  <th>Lignes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in store.state.entries" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.idClasseAcademique }}</td>
                  <td>{{ item.idVersionReferentielProgramme }}</td>
                  <td>{{ item.statut }}</td>
                  <td>{{ item.lignes.length }}</td>
                </tr>
              </tbody>
            </table>
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
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useProgrammesNiveauStore } from '../stores/programmes-niveau.store';

const store = useProgrammesNiveauStore();
const activeContext = activeContextStore.state;
const tenantContext = tenantContextStore.state;
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-LOC-005');
const idProgrammeNiveauInput = ref('');

const initialisation = reactive({
  idClasseAcademique: '',
  idReferentielProgramme: '',
  idVersionReferentielProgramme: '',
});

const hasActiveScope = computed(() =>
  tenantContext.schoolId.trim().length > 0 && activeContext.schoolYearId.trim().length > 0,
);

const hasMutationContext = computed(() =>
  hasActiveScope.value && tenantContext.userId.trim().length > 0,
);

const canInitialize = computed(() =>
  initialisation.idClasseAcademique.trim()
  && initialisation.idReferentielProgramme.trim()
  && initialisation.idVersionReferentielProgramme.trim()
  && hasMutationContext.value,
);

async function initialiser(): Promise<void> {
  if (!hasMutationContext.value) return;
  await store.initialiser({
      idEcole: tenantContext.schoolId.trim(),
      idAnneeScolaire: activeContext.schoolYearId.trim(),
      idClasseAcademique: initialisation.idClasseAcademique.trim(),
      idReferentielProgramme: initialisation.idReferentielProgramme.trim(),
      idVersionReferentielProgramme: initialisation.idVersionReferentielProgramme.trim(),
      creePar: tenantContext.userId.trim(),
  });
  idProgrammeNiveauInput.value = store.state.programme?.id ?? '';
  await lister();
}

async function lister(): Promise<void> {
  if (!hasActiveScope.value) return;
  await store.lister(tenantContext.schoolId.trim(), activeContext.schoolYearId.trim());
}

async function consulter(): Promise<void> {
  await store.consulter(idProgrammeNiveauInput.value.trim());
}

async function etatLocal(): Promise<void> {
  await store.etatLocal(idProgrammeNiveauInput.value.trim());
}

async function valider(): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.valider(idProgrammeNiveauInput.value.trim(), tenantContext.userId.trim());
  await lister();
}

async function archiver(): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.archiver(idProgrammeNiveauInput.value.trim(), tenantContext.userId.trim());
  await lister();
}
</script>

<style scoped>
.academique-context-strip,.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-context-chip{border-radius:20px;padding:1rem 1.1rem;background:#f4f8fb;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;min-width:220px}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-primary-action,.academique-secondary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-secondary-action{background:#fff;color:#11283f}
.academique-primary-action:disabled,.academique-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-table-shell{overflow:auto}
.academique-table{width:100%;border-collapse:collapse}
.academique-table th,.academique-table td{padding:.85rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.academique-table th{font-size:.84rem;text-transform:uppercase;color:#5e7385}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
