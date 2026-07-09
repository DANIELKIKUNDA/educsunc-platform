<template>
  <PageContainer>
    <PageHeader
      eyebrow="MF-04"
      title="Situation financiere synthetique ecole"
      description="Comparaison tabulaire des sections d une ecole, strictement heritee du moteur VF-01."
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

    <SectionBlock title="Cadre ecole" description="La vue garde un coeur tabulaire et numerique pour comparer les sections sans glisser vers un dashboard decoratif.">
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <School />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Ecole" :value="summary?.scopeLabel ?? fallbackScopeLabel" />
          <ContextBadge label="Periode" :value="summary?.periodeLabel ?? 'A connecter'" />
          <ContextBadge label="Type de frais" :value="summary?.typeFraisLabel ?? selectedTypeLabel" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="VF-04">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement de la synthese ecole" message="Consolidation des sections de l ecole en cours." />
      </template>
      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Synthese ecole indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Synthese non autorisee"
          message="Cette vue ecole reste reservee aux acteurs officiels autorises par le backend."
        />

        <template v-else>
          <SectionBlock title="Filtres" description="La vue laisse le backend recalculer la situation selon le mois et le type de frais.">
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Ecole</span>
                  <input v-model="ecoleLabelInput" type="text" placeholder="Nom de l ecole" />
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
                  <span>Charger l ecole</span>
                </button>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!summary"
            title="Synthese en attente"
            message="Renseignez l annee scolaire pour ouvrir la comparaison sectionnelle de l ecole."
          />

          <template v-else>
            <div class="finance-kpi-grid finance-kpi-grid--detail">
              <div class="finance-kpi-card">
                <small>Effectif ecole</small>
                <strong>{{ summary.totalGeneralEcole.effectifTotal }}</strong>
                <span>Total consolide des sections visibles</span>
              </div>
              <div class="finance-kpi-card">
                <small>Redevables</small>
                <strong>{{ summary.totalGeneralEcole.redevables }}</strong>
                <span>Base de recouvrement ecole</span>
              </div>
              <div class="finance-kpi-card">
                <small>Non en ordre</small>
                <strong>{{ summary.totalGeneralEcole.nonEnOrdre }}</strong>
                <span>Sections prioritaires a ouvrir</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant attendu</small>
                <strong>{{ formatCurrency(summary.totalGeneralEcole.montantAttendu) }}</strong>
                <span>Attendu global de l ecole</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant recouvre</small>
                <strong>{{ formatCurrency(summary.totalGeneralEcole.montantPaye) }}</strong>
                <span>Recouvrement visible</span>
              </div>
              <div class="finance-kpi-card">
                <small>Taux</small>
                <strong>{{ formatPercent(summary.totalGeneralEcole.tauxRecouvrement) }}</strong>
                <span>Taux moyen de l ecole</span>
              </div>
            </div>

            <SectionBlock title="Tableau comparatif des sections" description="Une ligne = une section. Fin obligatoire sur le total general ecole.">
              <div class="finance-table-shell">
                <table class="finance-table">
                  <thead>
                    <tr>
                      <th>Section</th>
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
                    <tr v-for="row in summary.rows" :key="row.idSectionScolaire">
                      <td>{{ row.section }}</td>
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
                          <RouterLink class="finance-link-action" :to="syntheseSectionLink(row.idSectionScolaire, row.section)">VF-03</RouterLink>
                          <RouterLink class="finance-link-action" :to="syntheseClasseHintLink(row.idSectionScolaire, row.section)">VF-02</RouterLink>
                          <RouterLink class="finance-link-action" :to="registreClasseHintLink(row.idSectionScolaire, row.section)">VF-01</RouterLink>
                        </div>
                      </td>
                    </tr>
                    <tr class="finance-table__total-row">
                      <td><strong>{{ summary.totalGeneralEcole.section }}</strong></td>
                      <td>{{ summary.totalGeneralEcole.effectifTotal }}</td>
                      <td>{{ summary.totalGeneralEcole.redevables }}</td>
                      <td>{{ summary.totalGeneralEcole.enOrdre }}</td>
                      <td>{{ summary.totalGeneralEcole.nonEnOrdre }}</td>
                      <td>{{ formatCurrency(summary.totalGeneralEcole.montantAttendu) }}</td>
                      <td>{{ formatCurrency(summary.totalGeneralEcole.montantPaye) }}</td>
                      <td>{{ formatCurrency(summary.totalGeneralEcole.resteARecouvrer) }}</td>
                      <td>{{ formatPercent(summary.totalGeneralEcole.tauxRecouvrement) }}</td>
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
import { ArrowLeft, FileText, Printer, School, Search, Sheet, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { useSchoolFinancialSummaryViewModel } from '../viewmodels/useSchoolFinancialSummaryViewModel';

const {
  context,
  session,
  summaryStore,
  idAnneeScolaireInput,
  anneeScolaireLabelInput,
  ecoleLabelInput,
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
  syntheseSectionLink,
  syntheseClasseHintLink,
  registreClasseHintLink,
  formatCurrency,
  formatPercent,
  exporterCsv,
  ouvrirVersionPdf,
  imprimerPage,
} = useSchoolFinancialSummaryViewModel();
</script>
