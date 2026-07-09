<template>
  <PageContainer>
    <PageHeader
      eyebrow="MF-03"
      title="Situation financiere synthetique par section"
      description="Comparaison tabulaire des classes d une section, heritee du moteur officiel sans duplications de calcul."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
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

    <SectionBlock title="Cadre sectionnel" description="Cette vue compare les classes d une section reelle et reste orientee vers l action.">
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <Building2 />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Section" :value="summary?.scopeLabel ?? fallbackScopeLabel" />
          <ContextBadge label="Periode" :value="summary?.periodeLabel ?? 'A connecter'" />
          <ContextBadge label="Type de frais" :value="summary?.typeFraisLabel ?? selectedTypeLabel" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="VF-03">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement de la synthese section" message="Consolidation des classes de la section en cours." />
      </template>
      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Synthese section indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Synthese non autorisee"
          message="Cette comparaison de section reste reservee aux acteurs officiels du perimetre."
        />

        <template v-else>
          <SectionBlock title="Filtres" description="Le frontend ne fait qu orienter la lecture; le backend calcule la synthese officielle.">
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Section</span>
                  <input v-model="sectionLabelInput" type="text" placeholder="Secondaire, primaire..." />
                </label>
                <label class="finance-field">
                  <span>Id section scolaire</span>
                  <input v-model="idSectionScolaireInput" type="text" placeholder="uuid-section" />
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
              <div class="finance-form-actions">
                <button class="finance-primary-action" type="button" @click="chargerSynthese">
                  <Search />
                  <span>Charger la section</span>
                </button>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!summary"
            title="Synthese en attente"
            message="Renseignez la section et l annee scolaire pour ouvrir la comparaison des classes."
          />

          <template v-else>
            <div class="finance-kpi-grid finance-kpi-grid--detail">
              <div class="finance-kpi-card">
                <small>Effectif section</small>
                <strong>{{ summary.totalGeneralSection.effectifTotal }}</strong>
                <span>Total agrégé des classes visibles</span>
              </div>
              <div class="finance-kpi-card">
                <small>Redevables</small>
                <strong>{{ summary.totalGeneralSection.redevables }}</strong>
                <span>Base de recouvrement sectionnelle</span>
              </div>
              <div class="finance-kpi-card">
                <small>Non en ordre</small>
                <strong>{{ summary.totalGeneralSection.nonEnOrdre }}</strong>
                <span>Classes prioritaires a ouvrir</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant attendu</small>
                <strong>{{ formatCurrency(summary.totalGeneralSection.montantAttendu) }}</strong>
                <span>Attendu agrégé de la section</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant recouvre</small>
                <strong>{{ formatCurrency(summary.totalGeneralSection.montantPaye) }}</strong>
                <span>Recouvrement global visible</span>
              </div>
              <div class="finance-kpi-card">
                <small>Taux</small>
                <strong>{{ formatPercent(summary.totalGeneralSection.tauxRecouvrement) }}</strong>
                <span>Taux moyen de la section</span>
              </div>
            </div>

            <SectionBlock title="Tableau comparatif des classes" description="Une ligne = une classe. Fin obligatoire sur le total general section.">
              <div class="finance-table-shell">
                <table class="finance-table">
                  <thead>
                    <tr>
                      <th>Classe</th>
                      <th>Effectif total</th>
                      <th>Redevables</th>
                      <th>En ordre</th>
                      <th>Non en ordre</th>
                      <th>Montant attendu</th>
                      <th>Montant recouvre</th>
                      <th>Reste</th>
                      <th>Taux</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in summary.rows" :key="row.idClassePedagogique">
                      <td>{{ row.classe }}</td>
                      <td>{{ row.effectifTotal }}</td>
                      <td>{{ row.redevables }}</td>
                      <td>{{ row.enOrdre }}</td>
                      <td>{{ row.nonEnOrdre }}</td>
                      <td>{{ formatCurrency(row.montantAttendu) }}</td>
                      <td>{{ formatCurrency(row.montantPaye) }}</td>
                      <td>{{ formatCurrency(row.resteARecouvrer) }}</td>
                      <td>{{ formatPercent(row.tauxRecouvrement) }}</td>
                      <td>
                        <div class="finance-register-actions">
                          <RouterLink class="finance-link-action" :to="syntheseClasseLink(row.idClassePedagogique, row.classe)">VF-02</RouterLink>
                          <RouterLink class="finance-link-action" :to="registreClasseLink(row.idClassePedagogique, row.classe)">VF-01</RouterLink>
                        </div>
                      </td>
                    </tr>
                    <tr class="finance-table__total-row">
                      <td><strong>{{ summary.totalGeneralSection.classe }}</strong></td>
                      <td>{{ summary.totalGeneralSection.effectifTotal }}</td>
                      <td>{{ summary.totalGeneralSection.redevables }}</td>
                      <td>{{ summary.totalGeneralSection.enOrdre }}</td>
                      <td>{{ summary.totalGeneralSection.nonEnOrdre }}</td>
                      <td>{{ formatCurrency(summary.totalGeneralSection.montantAttendu) }}</td>
                      <td>{{ formatCurrency(summary.totalGeneralSection.montantPaye) }}</td>
                      <td>{{ formatCurrency(summary.totalGeneralSection.resteARecouvrer) }}</td>
                      <td>{{ formatPercent(summary.totalGeneralSection.tauxRecouvrement) }}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>
          </template>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ArrowLeft, Building2, FileText, Printer, Search, Sheet, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { useSectionFinancialSummaryViewModel } from '../viewmodels/useSectionFinancialSummaryViewModel';

const {
  context,
  session,
  summaryStore,
  idAnneeScolaireInput,
  anneeScolaireLabelInput,
  idSectionScolaireInput,
  sectionLabelInput,
  moisAnalyseInput,
  typeFraisInput,
  moisOptions,
  typeFraisOptions,
  isAuthorized,
  summary,
  technicalErrorMessage,
  uiState,
  fallbackScopeLabel,
  selectedTypeLabel,
  perimeterMessage,
  synchroniserDepuisRoute,
  chargerSynthese,
  syntheseClasseLink,
  registreClasseLink,
  formatCurrency,
  formatPercent,
  exporterCsv,
  ouvrirVersionPdf,
  imprimerPage,
} = useSectionFinancialSummaryViewModel();
</script>
