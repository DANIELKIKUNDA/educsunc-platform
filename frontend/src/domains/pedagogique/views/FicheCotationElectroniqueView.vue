<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-01"
      title="Fiche de cotation electronique"
      description="Grille scolaire de lecture et de saisie, alignee strictement sur les fiches backend reelles."
    />

    <SectionBlock title="Doctrine d encodage" description="Le frontend n invente ni colonne, ni total, ni maxima.">
      <div class="grade-sheet-callout">
        <ShieldCheck />
        <p>{{ sheet?.actorScopeMessage ?? perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-001">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement de la fiche" message="Lecture de la classe, du cours et des fiches de cotation reelles." />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Fiche indisponible" :message="technicalErrorMessage" />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Fiche non autorisee"
          message="Cette fiche reste reservee a l enseignant concerne et au titulaire via ses capacites effectives."
        />

        <template v-else>
          <SectionBlock title="Contexte de travail" description="La fiche s ouvre toujours sur le vrai triplet classe, cours et annee.">
            <div class="grade-sheet-form-grid">
              <label class="grade-sheet-field">
                <span>Annee scolaire</span>
                <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
              </label>
              <label class="grade-sheet-field">
                <span>Id annee scolaire</span>
                <input v-model="idAnneeScolaireInput" type="text" placeholder="uuid-annee" />
              </label>
              <label class="grade-sheet-field">
                <span>Classe</span>
                <input v-model="classeLabelInput" type="text" placeholder="4e CG" />
              </label>
              <label class="grade-sheet-field">
                <span>Id classe pedagogique</span>
                <input v-model="idClassePedagogiqueInput" type="text" placeholder="uuid-classe" />
              </label>
              <label class="grade-sheet-field">
                <span>Cours</span>
                <input v-model="coursLabelInput" type="text" placeholder="Mathematiques" />
              </label>
              <label class="grade-sheet-field">
                <span>Id referentiel cours</span>
                <input v-model="idReferentielCoursInput" type="text" placeholder="uuid-cours" />
              </label>
              <label class="grade-sheet-field">
                <span>Enseignant</span>
                <input v-model="enseignantLabelInput" type="text" placeholder="Nom enseignant" />
              </label>
            </div>
            <div class="grade-sheet-actions-row">
              <button class="grade-sheet-primary-action" type="button" @click="chargerFiche">
                <Search />
                <span>Ouvrir la fiche</span>
              </button>
              <button class="grade-sheet-secondary-action" type="button" @click="synchroniserDepuisRoute">
                Reprendre la route
              </button>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!sheet"
            title="Fiche en attente"
            message="Renseignez la classe, le cours et l annee pour ouvrir la fiche electronique."
          />

          <template v-else>
            <div class="grade-sheet-kpi-grid">
              <div class="grade-sheet-kpi-card">
                <small>Portee</small>
                <strong>{{ sheet.scopeLabel }}</strong>
                <span>Contexte officiel de la fiche</span>
              </div>
              <div class="grade-sheet-kpi-card">
                <small>Structure</small>
                <strong>{{ sheet.structureLabel }}</strong>
                <span>{{ sheet.totalsReadonlyLabel }}</span>
              </div>
              <div class="grade-sheet-kpi-card">
                <small>Eleves attendus</small>
                <strong>{{ sheet.totalStudents }}</strong>
                <span>{{ sheet.totalFilledCells }} cases renseignees</span>
              </div>
              <div class="grade-sheet-kpi-card">
                <small>Cases restantes</small>
                <strong>{{ sheet.totalEmptyCells }}</strong>
                <span>{{ sheet.totalFailures }} echecs visibles</span>
              </div>
            </div>

            <SectionBlock title="Grille de cotation" description="Les maxima et les totaux viennent du backend, la saisie reste bornee aux colonnes autorisees.">
              <div class="grade-sheet-ribbon">
                <div>
                  <p class="grade-sheet-label">Statut d encodage</p>
                  <strong>{{ sheet.encodeStatusLabel }}</strong>
                </div>
                <div class="grade-sheet-ribbon__side">
                  <p class="grade-sheet-ribbon__message">{{ saveMessage ?? 'Aucune mutation en attente.' }}</p>
                  <div class="grade-sheet-ribbon__actions">
                    <button class="grade-sheet-secondary-action" type="button" @click="actualiserFiche">
                      Actualiser
                    </button>
                    <button
                      class="grade-sheet-secondary-action"
                      type="button"
                      :disabled="!hasDrafts"
                      @click="viderBrouillons"
                    >
                      Annuler les brouillons
                    </button>
                  </div>
                </div>
              </div>

              <div class="grade-sheet-table-shell">
                <table class="grade-sheet-table">
                  <thead>
                    <tr>
                      <th rowspan="2">No</th>
                      <th rowspan="2">Eleve</th>
                      <th v-for="column in sheet.columns" :key="column.code">
                        {{ column.label }}
                      </th>
                      <th rowspan="2">Renseignees</th>
                    </tr>
                    <tr>
                      <th v-for="column in sheet.columns" :key="`${column.code}-maximum`" class="grade-sheet-maximum">
                        {{ column.maximum ?? '-' }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="grade-sheet-maximum-label" colspan="2">MAXIMA</td>
                      <td
                        v-for="column in sheet.columns"
                        :key="`${column.code}-maximum-row`"
                        class="grade-sheet-maximum"
                      >
                        {{ column.maximum ?? '-' }}
                      </td>
                      <td class="grade-sheet-maximum">-</td>
                    </tr>

                    <tr v-for="(row, rowIndex) in sheet.rows" :key="row.idFicheCotationEleveCours">
                      <td>{{ rowIndex + 1 }}</td>
                      <td>
                        <div class="grade-sheet-student">
                          <strong>{{ row.eleveLabel }}</strong>
                          <div class="grade-sheet-student-meta">
                            <span
                              v-for="token in row.eleveMetaLabel.split(' • ').filter(Boolean)"
                              :key="`${row.idEleve}-${token}`"
                              class="grade-sheet-student-tag"
                            >
                              {{ token }}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        v-for="cell in row.cells"
                        :key="`${row.idFicheCotationEleveCours}-${cell.code}`"
                        :class="[
                          'grade-sheet-cell',
                          cell.isTotal ? 'is-total' : '',
                          cell.isFailure ? 'is-failure' : '',
                        ]"
                      >
                        <div v-if="cell.isEditable" class="grade-sheet-editable-cell">
                          <input
                            :value="lireBrouillon(row.idFicheCotationEleveCours, cell.code, cell.displayValue)"
                            type="number"
                            :min="0"
                            :max="cell.maximum"
                            @input="mettreAJourBrouillon(row.idFicheCotationEleveCours, cell.code, $event)"
                          />
                          <div class="grade-sheet-inline-actions">
                            <button
                              v-if="canWriteGradeSheet"
                              class="grade-sheet-inline-action"
                              type="button"
                              @click="enregistrerCellule(row.idFicheCotationEleveCours, cell.code)"
                            >
                              OK
                            </button>
                            <button
                              v-if="canWriteGradeSheet"
                              class="grade-sheet-inline-action ghost"
                              type="button"
                              @click="viderCellule(row.idFicheCotationEleveCours, cell.code)"
                            >
                              Vider
                            </button>
                          </div>
                        </div>
                        <span v-else>{{ cell.displayValue || '-' }}</span>
                      </td>
                      <td>{{ row.filledCells }}/{{ row.filledCells + row.emptyCells }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="grade-sheet-footer-grid">
                <div class="grade-sheet-footer-card">
                  <small>Eleves</small>
                  <strong>{{ sheet.totalStudents }}</strong>
                  <span>Lignes relues depuis le backend</span>
                </div>
                <div class="grade-sheet-footer-card">
                  <small>Colonnes saisissables</small>
                  <strong>{{ sheet.columns.filter((column) => column.isEditable).length }}</strong>
                  <span>Totaux exclus de la saisie</span>
                </div>
                <div class="grade-sheet-footer-card">
                  <small>Echecs visibles</small>
                  <strong>{{ sheet.totalFailures }}</strong>
                  <span>Signalement purement backend</span>
                </div>
              </div>
            </SectionBlock>
          </template>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import type { GradeSheetFilters } from '../models/grade-sheet.model';
import { useGradeSheetStore } from '../stores/grade-sheet.store';

const route = useRoute();
const router = useRouter();
const gradeSheetStore = useGradeSheetStore();
const session = sessionStore.state;
const doctrineAccess = useDoctrineAccess();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const idReferentielCoursInput = ref('');
const coursLabelInput = ref('');
const enseignantLabelInput = ref('');
const drafts = reactive<Record<string, string>>({});

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-001'));
const canWriteGradeSheet = computed(() => doctrineAccess.canUseAction('pedagogique.fiches.write', 'PED-001'));
const sheet = computed(() => gradeSheetStore.state.sheet);
const saveMessage = computed(() => gradeSheetStore.state.saveMessage);
const hasDrafts = computed(() => Object.keys(drafts).length > 0);
const technicalErrorMessage = computed(() =>
  gradeSheetStore.state.errorMessage ?? 'Le backend n a pas pu restituer la fiche de cotation attendue.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (gradeSheetStore.state.status === 'loading') {
    return 'loading';
  }
  if (gradeSheetStore.state.status === 'error') {
    return 'technical-error';
  }
  return 'idle';
});
const perimeterMessage = computed(() =>
  session.actorCode === 'TITULAIRE'
    ? 'Encodage borne a la classe titulaire, via les capacites effectives d enseignant.'
    : 'Encodage borne au cours et a la classe reellement affectes a l enseignant.',
);

function lireQueryString(name: string): string {
  const value = route.query[name];
  return typeof value === 'string' ? value : '';
}

function synchroniserDepuisRoute(): void {
  idAnneeScolaireInput.value = lireQueryString('idAnneeScolaire');
  anneeScolaireLabelInput.value = lireQueryString('anneeScolaire');
  idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
  classeLabelInput.value = lireQueryString('classe');
  idReferentielCoursInput.value = lireQueryString('idReferentielCours');
  coursLabelInput.value = lireQueryString('cours');
  enseignantLabelInput.value = lireQueryString('enseignant');
}

function buildFilters(): GradeSheetFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    idReferentielCours: idReferentielCoursInput.value.trim(),
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    coursLabel: coursLabelInput.value.trim() || undefined,
    enseignantLabel: enseignantLabelInput.value.trim() || undefined,
  };
}

function buildDraftKey(idFicheCotationEleveCours: string, codeColonne: string): string {
  return `${idFicheCotationEleveCours}:${codeColonne}`;
}

function lireBrouillon(idFicheCotationEleveCours: string, codeColonne: string, fallback: string): string {
  const key = buildDraftKey(idFicheCotationEleveCours, codeColonne);
  return drafts[key] ?? fallback;
}

function mettreAJourBrouillon(idFicheCotationEleveCours: string, codeColonne: string, event: Event): void {
  const target = event.target as HTMLInputElement;
  drafts[buildDraftKey(idFicheCotationEleveCours, codeColonne)] = target.value;
}

function trouverLigne(idFicheCotationEleveCours: string) {
  return sheet.value?.rows.find((row) => row.idFicheCotationEleveCours === idFicheCotationEleveCours) ?? null;
}

function trouverCellule(idFicheCotationEleveCours: string, codeColonne: string) {
  return trouverLigne(idFicheCotationEleveCours)?.cells.find((cell) => cell.code === codeColonne) ?? null;
}

async function chargerFiche(): Promise<void> {
  if (!isAuthorized.value) {
    gradeSheetStore.reinitialiser();
    return;
  }

  const filters = buildFilters();
  if (!filters.idAnneeScolaire || !filters.idClassePedagogique || !filters.idReferentielCours) {
    gradeSheetStore.reinitialiser();
    return;
  }

  await router.replace({
    query: {
      ...route.query,
      idAnneeScolaire: filters.idAnneeScolaire,
      anneeScolaire: filters.anneeScolaireLabel,
      idClassePedagogique: filters.idClassePedagogique,
      classe: filters.classeLabel,
      idReferentielCours: filters.idReferentielCours,
      cours: filters.coursLabel,
      enseignant: filters.enseignantLabel,
    },
  });

  await gradeSheetStore.charger(filters);
}

async function actualiserFiche(): Promise<void> {
  if (!sheet.value) {
    return;
  }

  await gradeSheetStore.charger(buildFilters());
}

function viderBrouillons(): void {
  Object.keys(drafts).forEach((key) => {
    delete drafts[key];
  });
}

async function enregistrerCellule(idFicheCotationEleveCours: string, codeColonne: string): Promise<void> {
  const row = trouverLigne(idFicheCotationEleveCours);
  const cell = trouverCellule(idFicheCotationEleveCours, codeColonne);

  if (!row || !cell || !cell.isEditable) {
    return;
  }

  const draftValue = lireBrouillon(idFicheCotationEleveCours, codeColonne, cell.displayValue);
  const numericValue = Number.parseInt(draftValue, 10);
  if (Number.isNaN(numericValue)) {
    return;
  }

  await gradeSheetStore.enregistrerCellule({
    idFicheCotationEleveCours,
    codeColonne,
    value: numericValue,
    version: row.version,
    hadExistingValue: cell.value !== null,
  }, buildFilters());

  delete drafts[buildDraftKey(idFicheCotationEleveCours, codeColonne)];
}

async function viderCellule(idFicheCotationEleveCours: string, codeColonne: string): Promise<void> {
  const row = trouverLigne(idFicheCotationEleveCours);
  const cell = trouverCellule(idFicheCotationEleveCours, codeColonne);

  if (!row || !cell || !cell.isEditable || cell.value === null) {
    drafts[buildDraftKey(idFicheCotationEleveCours, codeColonne)] = '';
    return;
  }

  await gradeSheetStore.viderCellule({
    idFicheCotationEleveCours,
    codeColonne,
    version: row.version,
  }, buildFilters());

  delete drafts[buildDraftKey(idFicheCotationEleveCours, codeColonne)];
}

synchroniserDepuisRoute();
if (idAnneeScolaireInput.value && idClassePedagogiqueInput.value && idReferentielCoursInput.value && isAuthorized.value) {
  void chargerFiche();
}
</script>

<style scoped>
.grade-sheet-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.grade-sheet-form-grid,.grade-sheet-kpi-grid,.grade-sheet-footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.grade-sheet-field{display:grid;gap:.45rem}
.grade-sheet-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.grade-sheet-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.grade-sheet-primary-action,.grade-sheet-secondary-action,.grade-sheet-inline-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.grade-sheet-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.grade-sheet-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.grade-sheet-kpi-card,.grade-sheet-footer-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.grade-sheet-ribbon{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;padding:1rem 1.1rem;border-radius:22px;background:linear-gradient(180deg,rgba(245,249,252,.98),rgba(255,255,255,.98));border:1px solid rgba(17,40,63,.08);margin-bottom:1rem}
.grade-sheet-label{margin:0 0 .35rem;color:#5d7385;font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
.grade-sheet-ribbon__side{display:grid;gap:.75rem;justify-items:end}
.grade-sheet-ribbon__message{margin:0;max-width:26rem;color:#325166;line-height:1.5}
.grade-sheet-ribbon__actions{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:flex-end}
.grade-sheet-table-shell{overflow:auto;border-radius:24px;border:1px solid rgba(17,40,63,.08);background:#fff;box-shadow:0 18px 45px rgba(17,40,63,.06)}
.grade-sheet-table{width:100%;border-collapse:separate;border-spacing:0}
.grade-sheet-table th,.grade-sheet-table td{padding:.8rem;border-bottom:1px solid rgba(17,40,63,.08);border-right:1px solid rgba(17,40,63,.06);vertical-align:top}
.grade-sheet-table th{position:sticky;top:0;background:#f6fafc;color:#17324a;font-size:.82rem;text-transform:uppercase;letter-spacing:.05em;z-index:1}
.grade-sheet-table th:last-child,.grade-sheet-table td:last-child{border-right:none}
.grade-sheet-maximum,.grade-sheet-maximum-label{background:#f0f7fb;font-weight:700;color:#11314b}
.grade-sheet-student{display:grid;gap:.35rem}
.grade-sheet-student-meta{display:flex;flex-wrap:wrap;gap:.35rem}
.grade-sheet-student-tag{display:inline-flex;align-items:center;border-radius:999px;background:#eef5fa;color:#315067;padding:.2rem .55rem;font-size:.74rem}
.grade-sheet-cell.is-total{background:#f7fbfe}
.grade-sheet-cell.is-failure{background:rgba(198,40,40,.08)}
.grade-sheet-editable-cell{display:grid;gap:.45rem;min-width:120px}
.grade-sheet-editable-cell input{width:100%;border-radius:14px;border:1px solid rgba(17,40,63,.18);padding:.65rem .75rem;background:#fff}
.grade-sheet-inline-actions{display:flex;gap:.4rem}
.grade-sheet-inline-action{padding:.4rem .7rem;font-size:.78rem}
.grade-sheet-inline-action.ghost{background:transparent}
@media (max-width: 960px){
  .grade-sheet-ribbon{flex-direction:column}
  .grade-sheet-ribbon__side{justify-items:start}
  .grade-sheet-ribbon__actions{justify-content:flex-start}
}
</style>
