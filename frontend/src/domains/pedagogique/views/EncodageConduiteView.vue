<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-06"
      title="Encodage de la conduite"
      description="Vue liste + edition de la conduite dans le bon perimetre autorise."
    />

    <SectionBlock title="Perimetre de conduite" description="Le frontend rend visible la doctrine permission + perimetre.">
      <div class="pedagogique-callout">
        <ShieldCheck />
        <p>{{ conduiteClasse?.actorScopeMessage ?? perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-007">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement de la conduite" message="Lecture des eleves et de leurs periodes de conduite en cours." />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Conduite indisponible" :message="technicalErrorMessage" />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Conduite non autorisee"
          message="Cette vue reste reservee au titulaire et au directeur de discipline dans leur vrai perimetre."
        />

        <template v-else>
          <div class="conduite-kpi-grid">
            <div class="conduite-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorCode }}</strong>
              <span>{{ perimeterMessage }}</span>
            </div>
            <div class="conduite-kpi-card">
              <small>Perimetre</small>
              <strong>{{ scopeLabel }}</strong>
              <span>Classe et annee de travail</span>
            </div>
            <div class="conduite-kpi-card">
              <small>Precontrole</small>
              <strong>{{ canLoad ? 'Pret' : 'Incomplet' }}</strong>
              <span>{{ missingFieldsLabel }}</span>
            </div>
          </div>

          <SectionBlock title="Filtres" description="La lecture et la mutation restent bornees a la classe et a l annee scolaire.">
            <div class="pedagogique-form-grid">
              <label class="pedagogique-field">
                <span>Annee scolaire</span>
                <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
              </label>
              <label class="pedagogique-field">
                <span>Id annee scolaire</span>
                <input v-model="idAnneeScolaireInput" type="text" placeholder="uuid-annee" />
              </label>
              <label class="pedagogique-field">
                <span>Section</span>
                <input v-model="sectionLabelInput" type="text" placeholder="Secondaire" />
              </label>
              <label class="pedagogique-field">
                <span>Classe</span>
                <input v-model="classeLabelInput" type="text" placeholder="4e CG" />
              </label>
              <label class="pedagogique-field">
                <span>Id classe pedagogique</span>
                <input v-model="idClassePedagogiqueInput" type="text" placeholder="uuid-classe" />
              </label>
            </div>

            <div class="conduite-checklist">
              <div :class="['conduite-check', idAnneeScolaireInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Annee scolaire</strong>
                <span>{{ idAnneeScolaireInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
              </div>
              <div :class="['conduite-check', idClassePedagogiqueInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Classe</strong>
                <span>{{ idClassePedagogiqueInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
              </div>
            </div>

            <div class="pedagogique-actions-row">
              <button class="pedagogique-primary-action" type="button" :disabled="!canLoad" @click="chargerClasse">
                <Search />
                <span>Charger la conduite</span>
              </button>
              <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
                Reprendre la route
              </button>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!conduiteClasse"
            title="Conduite en attente"
            message="Renseignez une classe et une annee scolaire pour ouvrir l encodage."
          />

          <template v-else>
            <div class="pedagogique-kpi-grid">
              <div class="pedagogique-kpi-card">
                <small>Portee</small>
                <strong>{{ conduiteClasse.scopeLabel }}</strong>
                <span>Contexte officiel</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Eleves</small>
                <strong>{{ conduiteClasse.totalEleves }}</strong>
                <span>Liste reelle du backend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Conduites encodees</small>
                <strong>{{ conduiteClasse.totalConduitesEncodees }}</strong>
                <span>Periodes deja renseignees</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Conduites restantes</small>
                <strong>{{ conduiteClasse.totalConduitesRestantes }}</strong>
                <span>Periodes encore sans points</span>
              </div>
            </div>

            <SectionBlock title="Liste + edition" description="La table reste le centre du workflow, avec edition detaillee a droite.">
              <div class="conduite-layout">
                <div class="pedagogique-table-shell">
                  <table class="pedagogique-table">
                    <thead>
                      <tr>
                        <th>Eleve</th>
                        <th>Sexe</th>
                        <th>Periodes</th>
                        <th>Encodees</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="line in conduiteClasse.lignes"
                        :key="line.idResultatBulletinEleve"
                        :class="selectedResultatId === line.idResultatBulletinEleve ? 'is-selected' : ''"
                      >
                        <td>
                          <div class="conduite-student">
                            <strong>{{ line.nomComplet }}</strong>
                            <small>{{ line.idEleve }}</small>
                          </div>
                        </td>
                        <td>{{ line.sexe }}</td>
                        <td>{{ line.periodes.map((periode) => periode.codePeriode).join(', ') }}</td>
                        <td>{{ line.conduitesEncodees }}/{{ line.periodes.length }}</td>
                        <td>
                          <button class="pedagogique-inline-action" type="button" @click="selectionnerLigne(line.idResultatBulletinEleve)">
                            Editer
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <aside class="conduite-panel" v-if="selectedLine">
                  <div class="conduite-panel__header">
                    <div>
                      <p class="pedagogique-label">Eleve</p>
                      <strong>{{ selectedLine.nomComplet }}</strong>
                      <small>{{ selectedLine.idEleve }}</small>
                    </div>
                    <span class="conduite-badge">{{ selectedLine.sexe }}</span>
                  </div>

                  <div class="conduite-periods">
                    <button
                      v-for="periode in selectedLine.periodes"
                      :key="periode.codePeriode"
                      type="button"
                      :class="[
                        'conduite-period-chip',
                        selectedPeriodCode === periode.codePeriode ? 'is-active' : '',
                      ]"
                      @click="selectionnerPeriode(periode.codePeriode)"
                    >
                      <strong>{{ periode.codePeriode }}</strong>
                      <small>{{ periode.pointsConduite }}</small>
                    </button>
                  </div>

                  <label class="pedagogique-field">
                    <span>Periode</span>
                    <select v-model="selectedPeriodCode">
                      <option v-for="periode in selectedLine.periodes" :key="periode.codePeriode" :value="periode.codePeriode">
                        {{ periode.codePeriode }}
                      </option>
                    </select>
                  </label>

                  <div class="conduite-panel__current" v-if="selectedPeriod">
                    <small>Conduite actuelle</small>
                    <strong>{{ selectedPeriod.conduite }}</strong>
                    <small>Application: {{ selectedPeriod.application }}</small>
                    <small>Points actuels: {{ selectedPeriod.pointsConduite }}</small>
                  </div>

                  <label class="pedagogique-field">
                    <span>Nouveaux points</span>
                    <input v-model="pointsConduiteInput" type="number" min="0" max="100" />
                  </label>

                  <div class="pedagogique-actions-row">
                    <button v-if="canWriteConduite" class="pedagogique-primary-action" type="button" :disabled="!selectedPeriod" @click="enregistrerConduite">
                      <Save />
                      <span>Enregistrer</span>
                    </button>
                  </div>

                  <p v-if="saveMessage" class="conduite-panel__message">{{ saveMessage }}</p>

                  <div class="conduite-panel__audit">
                    <div class="conduite-panel__audit-header">
                      <History />
                      <strong>Audit de conduite</strong>
                    </div>
                    <div v-if="auditEntries.length === 0" class="conduite-panel__audit-empty">
                      Aucune trace visible pour ce resultat.
                    </div>
                    <ul v-else class="conduite-panel__audit-list">
                      <li v-for="(entry, index) in auditEntries" :key="`${entry.dateAction}-${index}`">
                        <strong>{{ entry.action }}</strong>
                        <small>{{ formatDate(entry.dateAction) }}</small>
                        <small>{{ entry.idUtilisateur ?? 'systeme' }}</small>
                        <small>{{ entry.commentaire ?? 'Sans commentaire' }}</small>
                      </li>
                    </ul>
                  </div>
                </aside>
              </div>
            </SectionBlock>
          </template>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { History, Save, Search, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { type ConduiteClasseFilters } from '../models/conduite-management.model';
import { useConduiteManagementStore } from '../stores/conduite-management.store';

const route = useRoute();
const router = useRouter();
const context = activeContextStore.state;
const session = sessionStore.state;
const conduiteStore = useConduiteManagementStore();
const doctrineAccess = useDoctrineAccess();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const selectedResultatId = ref('');
const selectedPeriodCode = ref('');
const pointsConduiteInput = ref('');

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-007'));
const canWriteConduite = computed(() => doctrineAccess.canUseAction('pedagogique.conduite.write', 'PED-007'));
const conduiteClasse = computed(() => conduiteStore.state.classe);
const auditEntries = computed(() => conduiteStore.state.audit);
const saveMessage = computed(() => conduiteStore.state.saveMessage);
const technicalErrorMessage = computed(() =>
  conduiteStore.state.errorMessage ?? 'Le backend n a pas pu restituer la conduite attendue.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (conduiteStore.state.status === 'loading') {
    return 'loading';
  }
  if (conduiteStore.state.status === 'error') {
    return 'technical-error';
  }
  return 'idle';
});
const selectedLine = computed(() =>
  conduiteClasse.value?.lignes.find((line) => line.idResultatBulletinEleve === selectedResultatId.value) ?? null,
);
const selectedPeriod = computed(() =>
  selectedLine.value?.periodes.find((periode) => periode.codePeriode === selectedPeriodCode.value) ?? null,
);
const missingFields = computed(() => {
  const manquants: string[] = [];

  if (!idAnneeScolaireInput.value.trim()) {
    manquants.push('annee');
  }
  if (!idClassePedagogiqueInput.value.trim()) {
    manquants.push('classe');
  }

  return manquants;
});
const canLoad = computed(() => missingFields.value.length === 0);
const missingFieldsLabel = computed(() =>
  canLoad.value ? 'Toutes les donnees minimales sont presentes.' : `Manque: ${missingFields.value.join(', ')}`,
);
const scopeLabel = computed(() =>
  [anneeScolaireLabelInput.value.trim(), classeLabelInput.value.trim(), sectionLabelInput.value.trim()].filter(Boolean).join(' / ')
  || [idAnneeScolaireInput.value.trim(), idClassePedagogiqueInput.value.trim()].filter(Boolean).join(' / ')
  || 'Perimetre a renseigner',
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'TITULAIRE':
      return 'Encodage borne a la classe titulaire et a la bonne annee scolaire.';
    case 'DIRECTEUR_DISCIPLINE':
      return 'Encodage borne a la meme ecole et a la meme section secondaire.';
    default:
      return `Session visible ${session.actorLabel}. Aucun perimetre officiel de conduite n est ouvert pour cet acteur.`;
  }
});

function lireQueryString(name: string): string {
  const value = route.query[name];
  return typeof value === 'string' ? value : '';
}

function synchroniserDepuisRoute(): void {
  idAnneeScolaireInput.value = lireQueryString('idAnneeScolaire');
  anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
  idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
  classeLabelInput.value = lireQueryString('classe');
  sectionLabelInput.value = lireQueryString('section') || context.sectionName;
}

function buildFilters(): ConduiteClasseFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
  };
}

async function chargerClasse(): Promise<void> {
  if (!isAuthorized.value) {
    conduiteStore.reinitialiser();
    return;
  }

  const filters = buildFilters();
  if (!filters.idAnneeScolaire || !filters.idClassePedagogique) {
    conduiteStore.reinitialiser();
    return;
  }

  await router.replace({
    query: {
      ...route.query,
      idAnneeScolaire: filters.idAnneeScolaire,
      anneeScolaire: filters.anneeScolaireLabel,
      idClassePedagogique: filters.idClassePedagogique,
      classe: filters.classeLabel,
      section: filters.sectionLabel,
    },
  });

  await conduiteStore.charger(filters);

  if (conduiteStore.state.classe?.lignes.length) {
    const fallbackId = selectedResultatId.value || conduiteStore.state.classe.lignes[0].idResultatBulletinEleve;
    selectionnerLigne(fallbackId);
  }
}

function selectionnerLigne(idResultatBulletinEleve: string): void {
  selectedResultatId.value = idResultatBulletinEleve;
  const line = conduiteClasse.value?.lignes.find((entry) => entry.idResultatBulletinEleve === idResultatBulletinEleve);
  const periode = line?.periodes.find((entry) => entry.codePeriode === selectedPeriodCode.value) ?? line?.periodes[0];
  selectedPeriodCode.value = periode?.codePeriode ?? '';
  pointsConduiteInput.value = periode?.pointsConduiteValue?.toString() ?? '';
  void conduiteStore.chargerAudit(idResultatBulletinEleve);
}

function selectionnerPeriode(codePeriode: string): void {
  selectedPeriodCode.value = codePeriode;
  pointsConduiteInput.value = selectedPeriod.value?.pointsConduiteValue?.toString() ?? '';
}

async function enregistrerConduite(): Promise<void> {
  if (!selectedLine.value || !selectedPeriod.value) {
    return;
  }

  const value = Number.parseInt(pointsConduiteInput.value, 10);
  if (Number.isNaN(value)) {
    return;
  }

  await conduiteStore.encoder({
    idResultatBulletinEleve: selectedLine.value.idResultatBulletinEleve,
    codePeriode: selectedPeriod.value.codePeriode,
    pointsConduite: value,
  }, buildFilters());

  if (conduiteStore.state.classe !== null) {
    selectionnerLigne(selectedLine.value.idResultatBulletinEleve);
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
}

synchroniserDepuisRoute();
if (idAnneeScolaireInput.value && idClassePedagogiqueInput.value && isAuthorized.value) {
  void chargerClasse();
}
</script>

<style scoped>
.pedagogique-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.pedagogique-form-grid,.pedagogique-kpi-grid,.conduite-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-primary-action,.pedagogique-secondary-action,.pedagogique-inline-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-kpi-card,.conduite-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.conduite-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.conduite-check{border-radius:20px;padding:1rem;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;background:#fff}
.conduite-check.is-ready{background:linear-gradient(180deg,rgba(237,248,242,.98),rgba(255,255,255,.98));border-color:rgba(45,125,76,.18)}
.conduite-check.is-missing{background:linear-gradient(180deg,rgba(254,245,239,.98),rgba(255,255,255,.98));border-color:rgba(184,88,37,.15)}
.conduite-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(320px,1fr);gap:1rem}
.pedagogique-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.pedagogique-table{width:100%;border-collapse:collapse;min-width:780px}
.pedagogique-table th,.pedagogique-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.pedagogique-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.pedagogique-table tbody tr.is-selected{background:rgba(11,93,122,.06)}
.conduite-student{display:grid;gap:.15rem}
.conduite-student small{color:#61778a}
.conduite-panel{border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(244,249,252,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem;display:grid;gap:1rem;align-self:start}
.conduite-panel__header,.conduite-panel__audit-header{display:flex;justify-content:space-between;align-items:flex-start;gap:.75rem}
.conduite-panel__header small{display:block;color:#61778a;margin-top:.25rem}
.conduite-badge{display:inline-flex;align-items:center;justify-content:center;min-width:40px;padding:.35rem .6rem;border-radius:999px;background:#eaf3f8;color:#17324a;font-weight:700}
.conduite-periods{display:flex;flex-wrap:wrap;gap:.5rem}
.conduite-period-chip{border:1px solid rgba(17,40,63,.12);background:#fff;border-radius:18px;padding:.55rem .75rem;display:grid;gap:.15rem;text-align:left}
.conduite-period-chip.is-active{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.conduite-panel__current,.conduite-panel__audit-empty{border-radius:18px;background:#f6fafc;padding:.9rem;display:grid;gap:.2rem}
.conduite-panel__message{margin:0;color:#0b5d7a;font-weight:600}
.conduite-panel__audit-list{display:grid;gap:.8rem;padding-left:1rem;margin:0}
.conduite-panel__audit-list li{display:grid;gap:.2rem}
.pedagogique-label{margin:0 0 .2rem;color:#4f6677;font-size:.83rem;text-transform:uppercase;letter-spacing:.08em}
@media (max-width: 1080px){.conduite-layout{grid-template-columns:1fr}}
</style>
