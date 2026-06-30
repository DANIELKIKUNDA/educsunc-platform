<template>
  <PageContainer>
    <PageHeader
      eyebrow="MF-02"
      title="Situation financiere synthetique par classe"
      description="Synthese mensuelle officielle de la classe, derivee du moteur VF-01 sans recalcul frontend divergent."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <RouterLink class="module-quick-access__pill" :to="registreLink">
            <TableProperties />
            <span>Ouvrir VF-01</span>
          </RouterLink>
          <button class="module-quick-access__pill" type="button" :disabled="!summary" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="module-quick-access__pill" type="button" :disabled="!summary" @click="ouvrirVersionPdf">
            <FileText />
            <span>PDF</span>
          </button>
          <button class="module-quick-access__pill module-quick-access__pill--action" type="button" :disabled="!summary" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Cadre de lecture" description="Cette vue reste une synthese tabulaire de gestion, centree sur le temps et reliee au registre detaille.">
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <CalendarRange />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Portee" :value="summary?.scopeLabel ?? fallbackScopeLabel" />
          <ContextBadge label="Periode" :value="summary?.periodeLabel ?? 'A connecter'" />
          <ContextBadge label="Type de frais" :value="summary?.typeFraisLabel ?? selectedTypeLabel" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement de la synthese"
          message="Lecture des agrégats mensuels de classe en cours."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Synthese indisponible" :message="technicalErrorMessage" />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Synthese non autorisee"
          message="Cette synthese est reservee aux acteurs financiers et delegues officiellement dans leur perimetre."
        />

        <template v-else>
          <SectionBlock title="Filtres" description="Le backend reste la source de verite des calculs. Le frontend ne fait qu'orienter la lecture.">
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
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
                    <option v-for="mois in moisOptions" :key="mois" :value="mois">{{ mois }}</option>
                  </select>
                </label>
                <label class="finance-field">
                  <span>Type de frais</span>
                  <select v-model="typeFraisInput">
                    <option value="">Tous les frais mensuels</option>
                    <option v-for="type in typeFraisOptions" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </label>
              </div>
              <div class="finance-form-actions finance-form-actions--split">
                <button class="finance-primary-action" type="button" @click="chargerSynthese">
                  <Search />
                  <span>Charger la synthese</span>
                </button>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!summary"
            title="Synthese en attente"
            message="Renseignez la classe et l annee scolaire pour ouvrir la synthese officielle."
          />

          <template v-else>
            <div class="finance-kpi-grid finance-kpi-grid--detail">
              <div class="finance-kpi-card">
                <small>Effectif actuel</small>
                <strong>{{ summary.situationActuelle.effectifTotal }}</strong>
                <span>Effectif encore present dans le calcul courant</span>
              </div>
              <div class="finance-kpi-card">
                <small>Redevables actuels</small>
                <strong>{{ summary.situationActuelle.redevables }}</strong>
                <span>Lecture effective du mois/filtre charge</span>
              </div>
              <div class="finance-kpi-card">
                <small>Eleves non en ordre</small>
                <strong>{{ summary.situationActuelle.nonEnOrdre }}</strong>
                <span>Priorite immediate de recouvrement</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant attendu</small>
                <strong>{{ formatCurrency(summary.situationActuelle.montantAttendu) }}</strong>
                <span>Base mensuelle officielle</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant recouvre</small>
                <strong>{{ formatCurrency(summary.situationActuelle.montantPaye) }}</strong>
                <span>Montant deja percu sur le filtre courant</span>
              </div>
              <div class="finance-kpi-card">
                <small>Taux de recouvrement</small>
                <strong>{{ formatPercent(summary.situationActuelle.tauxRecouvrement) }}</strong>
                <span>Lecture synthetique avant ouverture du registre detaille</span>
              </div>
            </div>

            <SectionBlock title="Tableau principal mensuel" description="Une ligne = un mois. Les decisions restent rapides, lisibles et directement ouvrables.">
              <div class="finance-table-shell">
                <table class="finance-table">
                  <thead>
                    <tr>
                      <th>Mois</th>
                      <th>Effectif total</th>
                      <th>Redevables</th>
                      <th>En ordre</th>
                      <th>Non en ordre</th>
                      <th>Montant attendu</th>
                      <th>Montant recouvre</th>
                      <th>Reste a recouvrer</th>
                      <th>Taux</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in summary.rows" :key="row.id">
                      <td>{{ row.mois }}</td>
                      <td>{{ row.effectifTotal }}</td>
                      <td>{{ row.redevables }}</td>
                      <td>{{ row.enOrdre }}</td>
                      <td>{{ row.nonEnOrdre }}</td>
                      <td>{{ formatCurrency(row.montantAttendu) }}</td>
                      <td>{{ formatCurrency(row.montantPaye) }}</td>
                      <td>{{ formatCurrency(row.resteARecouvrer) }}</td>
                      <td>{{ formatPercent(row.tauxRecouvrement) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock title="Version mobile" description="Lecture compacte mois par mois, sans perdre les chiffres utiles.">
              <div class="finance-register-mobile-list">
                <article v-for="row in summary.rows" :key="`${row.id}-mobile`" class="finance-register-mobile-card">
                  <div class="finance-register-mobile-card__header">
                    <div>
                      <strong>{{ row.mois }}</strong>
                      <small>{{ row.redevables }} redevables | {{ row.nonEnOrdre }} non en ordre</small>
                    </div>
                    <span class="finance-status-badge" :class="row.nonEnOrdre > 0 ? 'finance-status-badge--warning' : 'finance-status-badge--success'">
                      {{ formatPercent(row.tauxRecouvrement) }}
                    </span>
                  </div>
                  <div class="finance-register-mobile-card__body">
                    <div><small>Attendu</small><strong>{{ formatCurrency(row.montantAttendu) }}</strong></div>
                    <div><small>Recouvre</small><strong>{{ formatCurrency(row.montantPaye) }}</strong></div>
                    <div><small>Reste</small><strong>{{ formatCurrency(row.resteARecouvrer) }}</strong></div>
                    <div><small>Effectif</small><strong>{{ row.effectifTotal }}</strong></div>
                  </div>
                </article>
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
import { ArrowLeft, CalendarRange, FileText, Printer, Search, Sheet, ShieldCheck, TableProperties } from 'lucide-vue-next';
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
  authorizedClassFinancialSummaryActors,
  type ClassFinancialSummaryFilters,
} from '../models/class-financial-summary.model';
import { useClassFinancialSummaryStore } from '../stores/class-financial-summary.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const route = useRoute();
const router = useRouter();
const summaryStore = useClassFinancialSummaryStore();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const moisAnalyseInput = ref('');
const typeFraisInput = ref('');

const moisOptions = ['Septembre', 'Octobre', 'Novembre', 'Decembre', 'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin'];
const typeFraisOptions = [
  { value: 'FRAIS_MINERVAL', label: 'Minerval' },
  { value: 'FRAIS_SCOLAIRES', label: 'Frais scolaires' },
  { value: 'FRAIS_ETAT', label: 'Frais Etat' },
  { value: 'FRAIS_INSCRIPTION', label: 'Frais inscription' },
  { value: 'FRAIS_TECHNIQUES', label: 'Frais techniques' },
  { value: 'AUTRE', label: 'Autre' },
];

const isAuthorized = computed(() =>
  authorizedClassFinancialSummaryActors.includes(session.actorCode as never),
);
const summary = computed(() => summaryStore.state.summary);
const technicalErrorMessage = computed(() =>
  summaryStore.state.errorMessage ?? 'Le backend n a pas pu restituer la synthese financiere de classe.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (summaryStore.state.status === 'loading') return 'loading';
  if (summaryStore.state.status === 'error') return 'technical-error';
  return 'idle';
});
const fallbackScopeLabel = computed(() => {
  const classe = classeLabelInput.value.trim() || 'Classe cible';
  const section = sectionLabelInput.value.trim() || context.sectionName;
  const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;
  return `${classe} | ${section} | ${annee}`;
});
const selectedTypeLabel = computed(() =>
  typeFraisOptions.find((item) => item.value === typeFraisInput.value)?.label ?? 'Tous les frais mensuels',
);
const registreLink = computed(() => ({
  path: '/app/finances/registre-classe',
  query: {
    idAnneeScolaire: idAnneeScolaireInput.value || undefined,
    anneeScolaire: anneeScolaireLabelInput.value || undefined,
    idClassePedagogique: idClassePedagogiqueInput.value || undefined,
    classe: classeLabelInput.value || undefined,
    section: sectionLabelInput.value || undefined,
    moisAnalyseJusqua: moisAnalyseInput.value || undefined,
  },
}));

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'PROMOTEUR_ORGANISATION':
    case 'GESTIONNAIRE_ORGANISATION':
      return `Lecture bornee a l organisation active ${context.organizationName}, avec descente controlee vers la classe cible.`;
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire et a la bonne annee scolaire.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
      return 'Lecture bornee a la section secondaire autorisee.';
    case 'DIRECTEUR_PRIMAIRE':
      return 'Lecture bornee a la section primaire autorisee.';
    case 'DIRECTEUR_MATERNELLE':
      return 'Lecture bornee a la section maternelle autorisee.';
    default:
      return `Lecture bornee a l ecole active ${context.schoolName}.`;
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
  typeFraisInput.value = lireQueryString('typeFrais');
}

function construireFiltres(): ClassFinancialSummaryFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    moisAnalyseJusqua: moisAnalyseInput.value.trim() || undefined,
    typeFrais: typeFraisInput.value.trim() || undefined,
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
  };
}

async function chargerSynthese(): Promise<void> {
  if (!isAuthorized.value) {
    summaryStore.reinitialiser();
    return;
  }

  const filtres = construireFiltres();
  if (filtres.idAnneeScolaire.length === 0 || filtres.idClassePedagogique.length === 0) {
    summaryStore.reinitialiser();
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
      typeFrais: filtres.typeFrais,
    },
  });

  await summaryStore.charger(filtres);
}

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %`;
}

function exporterCsv(): void {
  if (!summary.value) return;
  const headers = ['Mois', 'Effectif total', 'Redevables', 'En ordre', 'Non en ordre', 'Montant attendu', 'Montant recouvre', 'Reste', 'Taux'];
  const lines = summary.value.rows.map((row) => [
    row.mois,
    String(row.effectifTotal),
    String(row.redevables),
    String(row.enOrdre),
    String(row.nonEnOrdre),
    String(row.montantAttendu),
    String(row.montantPaye),
    String(row.resteARecouvrer),
    String(row.tauxRecouvrement),
  ]);
  const csv = [headers, ...lines].map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `synthese-financiere-classe-${idClassePedagogiqueInput.value || 'classe'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function construireHtmlImprimable(): string {
  if (!summary.value) {
    return '';
  }

  const bodyRows = summary.value.rows
    .map((row) => `
      <tr>
        <td>${row.mois}</td>
        <td>${row.effectifTotal}</td>
        <td>${row.redevables}</td>
        <td>${row.enOrdre}</td>
        <td>${row.nonEnOrdre}</td>
        <td>${formatCurrency(row.montantAttendu)}</td>
        <td>${formatCurrency(row.montantPaye)}</td>
        <td>${formatCurrency(row.resteARecouvrer)}</td>
        <td>${formatPercent(row.tauxRecouvrement)}</td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Synthese financiere de classe</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #102844; }
          h1, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #b9c6d8; padding: 6px 8px; text-align: left; }
          th { background: #e8eef6; }
        </style>
      </head>
      <body>
        <h1>Situation financiere synthetique par classe</h1>
        <p>${summary.value.scopeLabel}</p>
        <p>${summary.value.periodeLabel}</p>
        <p>${summary.value.typeFraisLabel}</p>
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Effectif total</th>
              <th>Redevables</th>
              <th>En ordre</th>
              <th>Non en ordre</th>
              <th>Montant attendu</th>
              <th>Montant recouvre</th>
              <th>Reste a recouvrer</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
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
  void chargerSynthese();
}
</script>
