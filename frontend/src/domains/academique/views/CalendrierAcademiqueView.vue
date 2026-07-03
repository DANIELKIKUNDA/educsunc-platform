<template>
  <PageContainer>
    <PageHeader eyebrow="ACA-06" title="Calendrier academique" description="Creation, consultation, ajustement, validation et verrouillage du calendrier academique local." />
    <AccessBoundary page-code="ACA-LOC-004">
      <ErrorState v-if="!isAuthorized" title="Acces non autorise" message="Cette vue locale academique reste reservee a l administrateur systeme ecole." />
      <template v-else>
        <SectionBlock title="Calendrier cible" description="Le backend porte la vraie logique de calendrier et de ses periodes.">
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
            <label class="academique-field"><span>Type structure evaluation</span><input v-model="typeStructureEvaluationInput" type="text" placeholder="SECONDAIRE_TRIMESTRIEL" /></label>
            <label class="academique-field"><span>Date debut annee</span><input v-model="dateDebutAnneeInput" type="date" /></label>
            <label class="academique-field"><span>Date fin annee</span><input v-model="dateFinAnneeInput" type="date" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canCreate" @click="creer">Creer</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !hasActiveScope" @click="consulterParEcoleEtAnnee">Consulter par ecole/annee</button>
          </div>
        </SectionBlock>

        <SectionBlock title="Periode pilote" description="Le patch de periode se fait par code documentaire de periode.">
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id calendrier</span><input v-model="idCalendrierInput" type="text" /></label>
            <label class="academique-field"><span>Code periode</span><input v-model="periode.code" type="text" placeholder="P1" /></label>
            <label class="academique-field"><span>Libelle</span><input v-model="periode.libelle" type="text" /></label>
            <label class="academique-field"><span>Ordre</span><input v-model="periode.ordre" type="number" min="1" /></label>
            <label class="academique-field"><span>Type periode</span><input v-model="periode.typePeriode" type="text" placeholder="PERIODE" /></label>
            <label class="academique-field"><span>Date debut</span><input v-model="periode.dateDebut" type="date" /></label>
            <label class="academique-field"><span>Date fin</span><input v-model="periode.dateFin" type="date" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !canPatchPeriode" @click="modifierPeriode">Modifier periode</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idCalendrierInput.trim() || !tenantContext.userId.trim()" @click="valider">Valider</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idCalendrierInput.trim() || !tenantContext.userId.trim()" @click="verrouiller">Verrouiller</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Calendrier academique" message="Lecture ou mutation du calendrier academique local en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Operation impossible" :message="store.state.errorMessage ?? 'Operation impossible.'" />
        <SectionBlock v-else-if="store.state.calendrier" title="Calendrier charge" description="La projection backend reste la source de verite du calendrier local.">
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.calendrier, null, 2) }}</pre>
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
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useCalendrierAcademiqueStore } from '../stores/calendrier-academique.store';

const store = useCalendrierAcademiqueStore();
const activeContext = activeContextStore.state;
const tenantContext = tenantContextStore.state;
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-LOC-004');
const typeStructureEvaluationInput = ref('');
const dateDebutAnneeInput = ref('');
const dateFinAnneeInput = ref('');
const idCalendrierInput = ref('');

const periode = reactive({
  code: '',
  libelle: '',
  ordre: '1',
  typePeriode: '',
  dateDebut: '',
  dateFin: '',
});

const hasActiveScope = computed(() =>
  tenantContext.schoolId.trim().length > 0 && activeContext.schoolYearId.trim().length > 0,
);

const hasMutationContext = computed(() =>
  hasActiveScope.value && tenantContext.userId.trim().length > 0,
);

const canCreate = computed(() =>
  typeStructureEvaluationInput.value.trim()
  && dateDebutAnneeInput.value.trim()
  && dateFinAnneeInput.value.trim()
  && hasMutationContext.value,
);
const canPatchPeriode = computed(() =>
  idCalendrierInput.value.trim()
  && periode.code.trim()
  && periode.libelle.trim()
  && periode.ordre.trim()
  && periode.typePeriode.trim()
  && periode.dateDebut.trim()
  && periode.dateFin.trim()
  && tenantContext.userId.trim().length > 0,
);

async function creer(): Promise<void> {
  if (!hasMutationContext.value) return;
  await store.creer({
      idEcole: tenantContext.schoolId.trim(),
      idAnneeScolaire: activeContext.schoolYearId.trim(),
      typeStructureEvaluation: typeStructureEvaluationInput.value.trim(),
      dateDebutAnnee: dateDebutAnneeInput.value,
      dateFinAnnee: dateFinAnneeInput.value,
      periodes: [{
        code: periode.code.trim() || 'P1',
        libelle: periode.libelle.trim() || 'Periode 1',
        ordre: Number.parseInt(periode.ordre, 10),
        typePeriode: periode.typePeriode.trim() || 'PERIODE',
        dateDebut: periode.dateDebut || dateDebutAnneeInput.value,
        dateFin: periode.dateFin || dateFinAnneeInput.value,
      }],
      creePar: tenantContext.userId.trim(),
  });
  idCalendrierInput.value = store.state.calendrier?.id ?? '';
}

async function consulterParEcoleEtAnnee(): Promise<void> {
  if (!hasActiveScope.value) return;
  await store.consulterParEcoleEtAnnee(tenantContext.schoolId.trim(), activeContext.schoolYearId.trim());
  idCalendrierInput.value = store.state.calendrier?.id ?? '';
}

async function modifierPeriode(): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.modifierPeriode(
      idCalendrierInput.value.trim(),
      periode.code.trim(),
      {
        code: periode.code.trim(),
        libelle: periode.libelle.trim(),
        ordre: Number.parseInt(periode.ordre, 10),
        typePeriode: periode.typePeriode.trim(),
        dateDebut: periode.dateDebut,
        dateFin: periode.dateFin,
        modifiePar: tenantContext.userId.trim(),
      },
    );
}

async function valider(): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.valider(idCalendrierInput.value.trim(), tenantContext.userId.trim());
}

async function verrouiller(): Promise<void> {
  if (!tenantContext.userId.trim()) return;
  await store.verrouiller(idCalendrierInput.value.trim(), tenantContext.userId.trim());
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
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
