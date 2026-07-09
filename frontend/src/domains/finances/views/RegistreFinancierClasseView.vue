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

    <AccessBoundary page-code="VF-01">
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
import { RouterLink } from 'vue-router';
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
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { useClassFinancialRegisterViewModel } from '../viewmodels/useClassFinancialRegisterViewModel';

const {
  context,
  session,
  registerStore,
  idAnneeScolaireInput,
  anneeScolaireLabelInput,
  idClassePedagogiqueInput,
  classeLabelInput,
  sectionLabelInput,
  moisAnalyseInput,
  mobileColumnCode,
  moisOptions,
  statusLegend,
  isAuthorized,
  register,
  technicalErrorMessage,
  uiState,
  fallbackScopeLabel,
  selectedMobileColumn,
  perimeterMessage,
  synchroniserDepuisRoute,
  reinitialiserFiltres,
  chargerRegistre,
  selectedMobileCell,
  formatCurrency,
  cellStatusClass,
  exporterCsv,
  ouvrirVersionPdf,
  imprimerPage,
} = useClassFinancialRegisterViewModel();
</script>
