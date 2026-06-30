<template>
  <PageContainer>
    <PageHeader
      eyebrow="MF-01"
      title="Registre financier de classe"
      description="Registre financier dense et decisionnel, branche sur le moteur VF-01 sans recalcul frontend parallele."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <button class="module-quick-access__pill" type="button" :disabled="!register" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="module-quick-access__pill" type="button" :disabled="!register" @click="ouvrirVersionPdf">
            <FileText />
            <span>PDF</span>
          </button>
          <button class="module-quick-access__pill module-quick-access__pill--action" type="button" :disabled="!register" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Perimetre et doctrine"
      description="Le registre reste une lecture de gestion par colonne et par eleve, jamais un dashboard decoratif global."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <TableProperties />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Portee" :value="register?.scopeLabel ?? fallbackScopeLabel" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">
          {{ perimeterMessage }}
        </p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement du registre"
          message="Lecture du registre financier, de ses colonnes et des statistiques par colonne en cours."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Registre indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Registre non autorise"
          message="Cette vue est reservee aux acteurs financiers et delegues officiellement dans leur perimetre."
        />

        <template v-else>
          <SectionBlock
            title="Filtres de lecture"
            description="Les calculs restent portes par le backend. Le frontend ne fait qu'exposer le bon perimetre et le bon axe temporel."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Organisation</span>
                  <input :value="context.organizationName" type="text" disabled />
                </label>

                <label class="finance-field">
                  <span>Ecole</span>
                  <input :value="context.schoolName" type="text" disabled />
                </label>

                <label class="finance-field">
                  <span>Section</span>
                  <input v-model="sectionLabelInput" type="text" placeholder="Secondaire, primaire..." />
                </label>

                <label class="finance-field">
                  <span>Classe</span>
                  <input v-model="classeLabelInput" type="text" placeholder="4e CG, 7e EB..." />
                </label>

                <label class="finance-field">
                  <span>Id classe pedagogique</span>
                  <input v-model="idClassePedagogiqueInput" type="text" placeholder="uuid-classe" />
                </label>

                <label class="finance-field">
                  <span>Id annee scolaire</span>
                  <input v-model="idAnneeScolaireInput" type="text" placeholder="uuid-annee" />
                </label>

                <label class="finance-field">
                  <span>Annee scolaire</span>
                  <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
                </label>

                <label class="finance-field">
                  <span>Mois analyse jusqu a</span>
                  <select v-model="moisAnalyseInput">
                    <option value="">Situation annuelle</option>
                    <option v-for="mois in moisOptions" :key="mois" :value="mois">
                      {{ mois }}
                    </option>
                  </select>
                </label>
              </div>

              <div class="finance-form-actions finance-form-actions--split">
                <button class="finance-primary-action" type="button" @click="chargerRegistre">
                  <Search />
                  <span>Charger le registre</span>
                </button>
                <div class="finance-inline-actions">
                  <button class="finance-secondary-soft-action" type="button" @click="synchroniserDepuisRoute">
                    Reprendre les parametres de route
                  </button>
                  <button class="finance-secondary-soft-action" type="button" @click="reinitialiserFiltres">
                    Reinitialiser
                  </button>
                </div>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Rappels VF-01 visibles</strong>
                </div>
                <ul>
                  <li>AG, EX, EX50, FN et PC ne sont comptes que sur les frais ou ils sont redevables.</li>
                  <li>AB, TR et DC sortent des calculs a partir de leur date d effet.</li>
                  <li>Les statistiques restent ligne par ligne sous chaque colonne du registre.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!register"
            title="Registre en attente"
            message="Renseignez l annee scolaire et la classe pedagogique pour charger le registre officiel."
          />

          <template v-else>
            <div class="finance-kpi-grid finance-kpi-grid--detail">
              <div class="finance-kpi-card">
                <small>Eleves visibles</small>
                <strong>{{ register.totalEleves }}</strong>
                <span>Effectif reel du registre charge</span>
              </div>
              <div class="finance-kpi-card">
                <small>Redevables actuels</small>
                <strong>{{ register.totalRedevablesActuels }}</strong>
                <span>Lecture de la colonne situation financiere</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant attendu actuel</small>
                <strong>{{ formatCurrency(register.totalAttenduActuel) }}</strong>
                <span>Base de reference pour les encaissements du registre</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant recouvre actuel</small>
                <strong>{{ formatCurrency(register.totalPayeActuel) }}</strong>
                <span>Somme deja recouvree dans le perimetre charge</span>
              </div>
              <div class="finance-kpi-card">
                <small>Reste a recouvrer</small>
                <strong>{{ formatCurrency(register.totalResteActuel) }}</strong>
                <span>Lecture directe du moteur financier backend</span>
              </div>
              <div class="finance-kpi-card">
                <small>Periode visible</small>
                <strong>{{ register.periodeLabel }}</strong>
                <span>Temps + classe + doctrine VF-01</span>
              </div>
            </div>

            <SectionBlock
              title="Legende des statuts"
              description="Les abreviations restent visibles pour permettre une lecture immediate du registre sans navigation supplementaire."
            >
              <div class="finance-register-legend">
                <span v-for="item in statusLegend" :key="item.code" class="finance-register-legend__item">
                  <strong>{{ item.code }}</strong>
                  <small>{{ item.label }}</small>
                </span>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Registre par eleve"
              description="Vue desktop dense du registre, suivie des statistiques par colonne. Aucune carte geante, aucune visualisation decorative."
            >
              <div class="finance-register-table-shell">
                <table class="finance-register-table">
                  <thead>
                    <tr>
                      <th class="finance-register-table__sticky">N°</th>
                      <th class="finance-register-table__sticky-2">Eleve</th>
                      <th>Sexe</th>
                      <th v-for="column in register.columns" :key="column.code">
                        <div class="finance-register-heading">
                          <strong>{{ column.libelle }}</strong>
                          <small>{{ column.type }}</small>
                        </div>
                      </th>
                      <th>Total attendu</th>
                      <th>Total paye</th>
                      <th>Reste</th>
                      <th>Etat</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in register.rows" :key="row.id">
                      <td class="finance-register-table__sticky">{{ row.numeroOrdre }}</td>
                      <td class="finance-register-table__sticky-2">
                        <div class="finance-register-student">
                          <strong>{{ row.fullName }}</strong>
                          <small>{{ row.matricule }} | {{ row.statutScolaire }}</small>
                        </div>
                      </td>
                      <td>{{ row.sexe }}</td>
                      <td v-for="cell in row.cells" :key="cell.colonneCode">
                        <div class="finance-register-cell" :class="{ 'finance-register-cell--not-due': !cell.estRedevable }">
                          <strong :class="cellStatusClass(cell.statutAffiche)">
                            {{ cell.statutAffiche }}
                          </strong>
                          <small>{{ cell.estRedevable ? formatCurrency(cell.montantPaye) : 'Non redevable' }}</small>
                          <small v-if="cell.estRedevable">Attendu {{ formatCurrency(cell.montantAttendu) }}</small>
                          <small v-if="cell.estRedevable">Reste {{ formatCurrency(cell.resteARecouvrer) }}</small>
                        </div>
                      </td>
                      <td>{{ formatCurrency(row.totalAttendu) }}</td>
                      <td>{{ formatCurrency(row.totalPaye) }}</td>
                      <td>{{ formatCurrency(row.totalReste) }}</td>
                      <td>
                        <span
                          class="finance-status-badge"
                          :class="row.estEnOrdre ? 'finance-status-badge--success' : 'finance-status-badge--warning'"
                        >
                          {{ row.estEnOrdre ? 'En ordre' : 'Non en ordre' }}
                        </span>
                      </td>
                      <td>
                        <div class="finance-register-actions">
                          <RouterLink class="finance-link-action" :to="`/app/finances/dettes/${row.id}`">
                            Dette
                          </RouterLink>
                          <RouterLink class="finance-link-action" :to="`/app/finances/historiques/${row.id}`">
                            Historique
                          </RouterLink>
                          <RouterLink class="finance-link-action" :to="`/app/finances/arrieres/${row.id}`">
                            Arrieres
                          </RouterLink>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="finance-register-stats">
                <div class="finance-register-stats__header">
                  <BarChart3 />
                  <div>
                    <strong>Statistiques par colonne</strong>
                    <p>Chaque ligne correspond a une mesure VF-01 et reste alignee sur les colonnes du registre.</p>
                  </div>
                </div>
                <div class="finance-register-stats__table-shell">
                  <table class="finance-register-stats__table">
                    <thead>
                      <tr>
                        <th>Mesure</th>
                        <th v-for="column in register.columns" :key="column.code">
                          {{ column.shortLabel }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="statRow in register.statisticRows" :key="statRow.metricCode">
                        <td>{{ statRow.metricLabel }}</td>
                        <td v-for="column in register.columns" :key="column.code">
                          {{ statRow.values[column.code] }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Version mobile utile"
              description="Lecture compacte du meme registre, colonne par colonne, sans perdre la logique metier."
            >
              <div class="finance-form-stack">
                <label class="finance-field">
                  <span>Colonne mobile active</span>
                  <select v-model="mobileColumnCode">
                    <option v-for="column in register.columns" :key="column.code" :value="column.code">
                      {{ column.libelle }}
                    </option>
                  </select>
                </label>

                <div class="finance-register-mobile-list">
                  <article v-for="row in register.rows" :key="`${row.id}-mobile`" class="finance-register-mobile-card">
                    <div class="finance-register-mobile-card__header">
                      <div>
                        <strong>{{ row.fullName }}</strong>
                        <small>{{ row.matricule }} | {{ row.sexe }} | {{ row.statutScolaire }}</small>
                      </div>
                      <span
                        class="finance-status-badge"
                        :class="row.estEnOrdre ? 'finance-status-badge--success' : 'finance-status-badge--warning'"
                      >
                        {{ row.estEnOrdre ? 'En ordre' : 'Non en ordre' }}
                      </span>
                    </div>
                    <div class="finance-register-mobile-card__body">
                      <div>
                        <small>Colonne active</small>
                        <strong>{{ selectedMobileColumn?.libelle ?? 'Selectionnez une colonne' }}</strong>
                      </div>
                      <div>
                        <small>Statut</small>
                        <strong :class="cellStatusClass(selectedMobileCell(row)?.statutAffiche ?? 'NR')">
                          {{ selectedMobileCell(row)?.statutAffiche ?? 'NR' }}
                        </strong>
                      </div>
                      <div>
                        <small>Montant paye</small>
                        <strong>{{ formatCurrency(selectedMobileCell(row)?.montantPaye ?? 0) }}</strong>
                      </div>
                      <div>
                        <small>Reste</small>
                        <strong>{{ formatCurrency(selectedMobileCell(row)?.resteARecouvrer ?? 0) }}</strong>
                      </div>
                    </div>
                  </article>
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
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Printer,
  Search,
  Sheet,
  ShieldCheck,
  TableProperties,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import {
  authorizedClassFinancialRegisterActors,
  type ClassFinancialRegisterCellViewModel,
  type ClassFinancialRegisterFilters,
  type ClassFinancialRegisterRowViewModel,
} from '../models/class-financial-register.model';
import { useClassFinancialRegisterStore } from '../stores/class-financial-register.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const route = useRoute();
const router = useRouter();
const registerStore = useClassFinancialRegisterStore();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const moisAnalyseInput = ref('');
const mobileColumnCode = ref('');

const moisOptions = [
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
];

const statusLegend = [
  { code: 'AG', label: 'Enfant agent' },
  { code: 'EX', label: 'Exonere total' },
  { code: 'EX50', label: 'Exonere partiel' },
  { code: 'FN', label: 'Fonds non redevables selon le frais' },
  { code: 'PC', label: 'Prise en charge partielle ou ciblee' },
  { code: 'AB', label: 'Abandon, hors calcul apres date' },
  { code: 'TR', label: 'Transfere, hors calcul apres date' },
  { code: 'DC', label: 'Decede, hors calcul apres date' },
];

const isAuthorized = computed(() =>
  authorizedClassFinancialRegisterActors.includes(session.actorCode as never),
);
const register = computed(() => registerStore.state.register);
const technicalErrorMessage = computed(() =>
  registerStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer le registre financier de classe.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (registerStore.state.status === 'loading') {
    return 'loading';
  }

  if (registerStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const fallbackScopeLabel = computed(() => {
  const classe = classeLabelInput.value.trim() || 'Classe cible';
  const section = sectionLabelInput.value.trim() || context.sectionName;
  const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;

  return `${classe} | ${section} | ${annee}`;
});

const selectedMobileColumn = computed(() =>
  register.value?.columns.find((column) => column.code === mobileColumnCode.value) ?? null,
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'PROMOTEUR_ORGANISATION':
    case 'GESTIONNAIRE_ORGANISATION':
      return `Lecture bornee a l organisation active ${context.organizationName}, avec descente controlee vers l ecole puis la classe.`;
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire et a l annee scolaire active, jamais a une autre classe.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
      return 'Lecture bornee a la section secondaire autorisee dans l ecole active.';
    case 'DIRECTEUR_PRIMAIRE':
      return 'Lecture bornee a la section primaire autorisee dans l ecole active.';
    case 'DIRECTEUR_MATERNELLE':
      return 'Lecture bornee a la section maternelle autorisee dans l ecole active.';
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture bornee a l ecole active ${context.schoolName} et a la classe demandee.`;
    default:
      return `Session visible ${session.actorLabel}. Aucun perimetre financier officiel n est ouvert pour cet acteur.`;
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
  moisAnalyseInput.value = lireQueryString('moisAnalyseJusqua');
}

function reinitialiserFiltres(): void {
  idAnneeScolaireInput.value = '';
  anneeScolaireLabelInput.value = context.schoolYearLabel;
  idClassePedagogiqueInput.value = '';
  classeLabelInput.value = '';
  sectionLabelInput.value = context.sectionName;
  moisAnalyseInput.value = '';
  mobileColumnCode.value = '';
  registerStore.reinitialiser();
}

function construireFiltres(): ClassFinancialRegisterFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    moisAnalyseJusqua: moisAnalyseInput.value.trim() || undefined,
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
  };
}

async function chargerRegistre(): Promise<void> {
  if (!isAuthorized.value) {
    registerStore.reinitialiser();
    return;
  }

  const filtres = construireFiltres();

  if (filtres.idAnneeScolaire.length === 0 || filtres.idClassePedagogique.length === 0) {
    registerStore.reinitialiser();
    return;
  }

  await router.replace({
    query: {
      ...route.query,
      idAnneeScolaire: filtres.idAnneeScolaire,
      anneeScolaire: filtres.anneeScolaireLabel,
      idClassePedagogique: filtres.idClassePedagogique,
      classe: filtres.classeLabel,
      section: filtres.sectionLabel,
      moisAnalyseJusqua: filtres.moisAnalyseJusqua,
    },
  });

  await registerStore.charger(filtres);

  if (!mobileColumnCode.value && registerStore.state.register?.columns.length) {
    mobileColumnCode.value = registerStore.state.register.columns[0].code;
  }
}

function selectedMobileCell(row: ClassFinancialRegisterRowViewModel): ClassFinancialRegisterCellViewModel | null {
  return row.cells.find((cell) => cell.colonneCode === mobileColumnCode.value) ?? null;
}

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function cellStatusClass(code: string): string {
  if (code === 'OK') {
    return 'finance-register-token finance-register-token--success';
  }

  if (code === 'AB' || code === 'TR' || code === 'DC') {
    return 'finance-register-token finance-register-token--muted';
  }

  if (code === 'NR') {
    return 'finance-register-token finance-register-token--neutral';
  }

  return 'finance-register-token finance-register-token--warning';
}

function exporterCsv(): void {
  if (!register.value) {
    return;
  }

  const headers = [
    'Numero',
    'Matricule',
    'Nom complet',
    'Sexe',
    ...register.value.columns.map((column) => column.libelle),
    'Total attendu',
    'Total paye',
    'Reste',
    'Etat',
  ];

  const lines = register.value.rows.map((row) => [
    String(row.numeroOrdre),
    row.matricule,
    row.fullName,
    row.sexe,
    ...row.cells.map((cell) => cell.statutAffiche),
    String(row.totalAttendu),
    String(row.totalPaye),
    String(row.totalReste),
    row.estEnOrdre ? 'En ordre' : 'Non en ordre',
  ]);

  const csv = [headers, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `registre-financier-classe-${idClassePedagogiqueInput.value || 'classe'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function construireHtmlImprimable(): string {
  if (!register.value) {
    return '';
  }

  const headerCells = register.value.columns
    .map((column) => `<th>${column.libelle}</th>`)
    .join('');

  const bodyRows = register.value.rows
    .map((row) => `
      <tr>
        <td>${row.numeroOrdre}</td>
        <td>${row.fullName}</td>
        <td>${row.sexe}</td>
        ${row.cells.map((cell) => `<td>${cell.statutAffiche}</td>`).join('')}
        <td>${formatCurrency(row.totalAttendu)}</td>
        <td>${formatCurrency(row.totalPaye)}</td>
        <td>${formatCurrency(row.totalReste)}</td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Registre financier de classe</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #102844; }
          h1, h2, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #b9c6d8; padding: 6px 8px; text-align: left; vertical-align: top; }
          th { background: #e8eef6; }
          .meta { margin-bottom: 12px; }
          .meta strong { display: inline-block; min-width: 120px; }
        </style>
      </head>
      <body>
        <h1>Registre financier de classe</h1>
        <p>${register.value.scopeLabel}</p>
        <p>${register.value.periodeLabel}</p>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Eleve</th>
              <th>Sexe</th>
              ${headerCells}
              <th>Total attendu</th>
              <th>Total paye</th>
              <th>Reste</th>
            </tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

function ouvrirVersionPdf(): void {
  const html = construireHtmlImprimable();

  if (html.length === 0) {
    return;
  }

  const popup = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=900');

  if (!popup) {
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}

function imprimerPage(): void {
  window.print();
}

synchroniserDepuisRoute();

if (idAnneeScolaireInput.value && idClassePedagogiqueInput.value && isAuthorized.value) {
  void chargerRegistre();
}
</script>
