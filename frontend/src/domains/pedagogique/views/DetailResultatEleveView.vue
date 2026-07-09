<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-08"
      title="Detail resultat eleve"
      description="Fiche analytique d un eleve branchee sur ResultatBulletinEleve, ses diagnostics et son evolution reelle."
    >
      <template #actions>
        <div class="pedagogique-actions">
          <RouterLink class="pedagogique-pill" to="/app/pedagogique/resultats/analyses">
            <ArrowLeft />
            <span>Retour analyses</span>
          </RouterLink>
          <button class="pedagogique-pill" type="button" :disabled="!detail" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="pedagogique-pill" type="button" :disabled="!detail" @click="ouvrirVersionPdf">
            <FileText />
            <span>PDF</span>
          </button>
          <button class="pedagogique-pill pedagogique-pill--action" type="button" :disabled="!detail" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre pedagogique" description="La fiche lit uniquement le resultat consolide accessible a l acteur courant dans son vrai perimetre.">
      <div class="pedagogique-hero">
        <div class="pedagogique-hero__lead">
          <div class="pedagogique-hero__icon">
            <BadgeCheck />
          </div>
          <div>
            <h3>{{ detail?.eleveLabel ?? (eleveLabelInput || 'Eleve cible') }}</h3>
            <p>{{ detail?.classeLabel ?? (classeLabelInput || 'Classe cible') }} | {{ detail?.anneeScolaireLabel ?? (anneeScolaireLabelInput || context.schoolYearLabel) }}</p>
            <p>{{ actorScopeMessage }}</p>
          </div>
        </div>
        <div class="pedagogique-badges">
          <PermissionTag capability="module.pedagogique.access" label="Module pedagogique" />
          <ContextBadge label="Acteur" :value="session.actorLabel" />
          <ContextBadge label="Section" :value="detail?.sectionLabel ?? (sectionLabelInput || context.sectionName || 'Section active')" />
          <ContextBadge label="Colonne" :value="activeColumnLabel" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-DET-001">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement du detail resultat"
          message="Lecture du resultat consolide, des diagnostics et de l evolution en cours."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Detail resultat indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Detail resultat non autorise"
          message="Cette fiche est reservee au titulaire, au prefet des etudes et au directeur des etudes dans leur perimetre."
        />

        <template v-else>
          <SectionBlock
            title="Chargement de la fiche"
            description="Le detail eleve reste pilote par l annee scolaire, l eleve cible et la colonne d observation."
          >
            <div class="pedagogique-kpi-grid">
              <div class="pedagogique-kpi-card">
                <small>Acteur</small>
                <strong>{{ session.actorLabel }}</strong>
                <span>{{ detail ? 'Lecture ouverte' : 'Lecture en attente' }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Perimetre</small>
                <strong>{{ detail?.sectionLabel ?? (sectionLabelInput || context.sectionName || 'Section active') }}</strong>
                <span>{{ detail?.classeLabel ?? (classeLabelInput || 'Classe non renseignee') }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Colonne active</small>
                <strong>{{ activeColumnLabel }}</strong>
                <span>{{ detail?.resumePourcentage ?? 'Aucune lecture courante' }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Eligibilite</small>
                <strong>{{ canLoad ? 'Prete' : 'Incomplete' }}</strong>
                <span>Eleve + annee obligatoires</span>
              </div>
            </div>

            <div class="pedagogique-form-stack">
              <div class="pedagogique-filter-grid">
                <label class="pedagogique-field">
                  <span>Annee scolaire</span>
                  <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
                </label>
                <div class="pedagogique-context-card">
                  <small>Id annee scolaire active</small>
                  <strong>{{ context.schoolYearId || 'Annee scolaire active requise' }}</strong>
                  <span>Herite du Shell global.</span>
                </div>
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
                <label class="pedagogique-field">
                  <span>Eleve</span>
                  <input v-model="eleveLabelInput" type="text" placeholder="Nom complet eleve" />
                </label>
                <label class="pedagogique-field">
                  <span>Id eleve</span>
                  <input v-model="idEleveInput" type="text" placeholder="uuid-eleve" />
                </label>
                <label class="pedagogique-field">
                  <span>Colonne d observation</span>
                  <select v-model="codeColonneInput">
                    <option v-for="column in columnOptions" :key="column" :value="column">
                      {{ column }}
                    </option>
                  </select>
                </label>
              </div>

              <div class="pedagogique-guard-panel">
                <div class="pedagogique-guard-panel__header">
                  <ShieldCheck />
                  <strong>Garde-fous MP-08</strong>
                </div>
                <ul>
                  <li>Le frontend ne recalcule aucun rang ni pourcentage.</li>
                  <li>Les diagnostics viennent directement de `ResultatBulletinEleve`.</li>
                  <li>La meme doctrine permission + perimetre que `MP-07` reste appliquee.</li>
                </ul>
              </div>

              <div class="pedagogique-actions-row">
                <button class="pedagogique-primary-action" type="button" :disabled="!canLoad" @click="chargerDetail">
                  <Search />
                  <span>Charger la fiche</span>
                </button>
                <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
                  Reprendre la route
                </button>
                <button class="pedagogique-secondary-action" type="button" @click="reinitialiserFiltres">
                  Reinitialiser
                </button>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!detail"
            title="Fiche eleve en attente"
            message="Renseignez l eleve et l annee scolaire pour consulter le detail resultat."
          />

          <template v-else>
            <SectionBlock title="Resume analytique" description="Lecture rapide du resultat global, des diagnostics et de l evolution exposee.">
              <div class="analysis-kpi-grid">
                <div class="analysis-kpi-card">
                  <small>Pourcentage global</small>
                  <strong>{{ detail.resumePourcentage }}</strong>
                  <span>Lecture consolidee</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Rang</small>
                  <strong>{{ detail.resumeRang }}</strong>
                  <span>Classement officiel</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Diagnostics</small>
                  <strong>{{ detail.nombreDiagnostics }}</strong>
                  <span>Colonnes avec diagnostic</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Colonnes resultat</small>
                  <strong>{{ detail.resultColumns.length }}</strong>
                  <span>Vue consolidee</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Applications / conduite</small>
                  <strong>{{ detail.applications.length }}</strong>
                  <span>Blocs periodises exposes</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Evolution</small>
                  <strong>{{ detail.evolution.length }}</strong>
                  <span>Observations historisees</span>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title="Identite et contexte" description="La fiche garde visibles les informations de contexte utilisees pour la lecture.">
              <div class="analysis-student-grid">
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Eleve</p>
                  <strong>{{ detail.eleveLabel }}</strong>
                  <span>{{ detail.eleveId }}</span>
                </div>
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Classe</p>
                  <strong>{{ detail.classeLabel }}</strong>
                  <span>{{ detail.classeId }}</span>
                </div>
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Section</p>
                  <strong>{{ detail.sectionLabel }}</strong>
                  <span>{{ detail.anneeScolaireLabel }}</span>
                </div>
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Observation active</p>
                  <strong>{{ activeColumnLabel }}</strong>
                  <span>{{ actorScopeMessage }}</span>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Colonnes de resultat"
              description="Tableau principal des colonnes consolidees exposees par ResultatBulletinEleve."
            >
              <div class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Colonne</th>
                      <th>Total obtenu</th>
                      <th>Maximum</th>
                      <th>Pourcentage</th>
                      <th>Rang</th>
                      <th>Classable</th>
                      <th>Non classe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="column in detail.resultColumns" :key="column.code">
                      <td>
                        <strong>{{ column.label }}</strong>
                        <div class="pedagogique-muted">{{ column.code }}</div>
                      </td>
                      <td>{{ column.totalObtenu }}</td>
                      <td>{{ column.maximumGeneral }}</td>
                      <td>{{ column.pourcentage }}</td>
                      <td>{{ column.rang }}</td>
                      <td>
                        <span :class="column.estClassable ? 'status-chip status-chip--ok' : 'status-chip status-chip--neutral'">
                          {{ column.estClassable ? 'Oui' : 'Non' }}
                        </span>
                      </td>
                      <td>
                        <span :class="column.estNonClasse ? 'status-chip status-chip--warn' : 'status-chip status-chip--ok'">
                          {{ column.estNonClasse ? 'Oui' : 'Non' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Diagnostics"
              description="Lecture directe des diagnostics exposes, sans commentaire invente par le frontend."
            >
              <div v-if="detail.diagnostics.length === 0" class="pedagogique-empty-inline">
                Aucun diagnostic expose pour cette fiche.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Colonne</th>
                      <th>Echecs</th>
                      <th>Echecs legers</th>
                      <th>Echecs profonds</th>
                      <th>Perequation</th>
                      <th>Repechage</th>
                      <th>Commentaire technique</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="diagnostic in detail.diagnostics" :key="diagnostic.code">
                      <td>{{ diagnostic.label }}</td>
                      <td>{{ diagnostic.nombreEchecs }}</td>
                      <td>{{ diagnostic.nombreEchecsLegers }}</td>
                      <td>{{ diagnostic.nombreEchecsProfonds }}</td>
                      <td>{{ diagnostic.eligiblePerequation ? 'Oui' : 'Non' }}</td>
                      <td>{{ diagnostic.eligibleRepechage ? 'Oui' : 'Non' }}</td>
                      <td>{{ diagnostic.commentaireTechnique }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Application et conduite"
              description="Lecture periodisee de l application et de la conduite lorsqu elles sont exposees."
            >
              <div v-if="detail.applications.length === 0" class="pedagogique-empty-inline">
                Aucun bloc application / conduite n est expose pour cette fiche.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Periode</th>
                      <th>Application</th>
                      <th>Conduite</th>
                      <th>Points conduite</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="application in detail.applications" :key="application.codePeriode">
                      <td>{{ application.codePeriode }}</td>
                      <td>{{ application.application }}</td>
                      <td>{{ application.conduite }}</td>
                      <td>{{ application.pointsConduite }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Evolution du resultat"
              description="Historique d observation backend pour la colonne ciblee."
            >
              <div v-if="detail.evolution.length === 0" class="pedagogique-empty-inline">
                Aucune evolution n est exposee pour cette combinaison eleve / colonne.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Colonne</th>
                      <th>Total</th>
                      <th>Maximum</th>
                      <th>Pourcentage</th>
                      <th>Rang</th>
                      <th>Etat courant</th>
                      <th>Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in detail.evolution" :key="`${entry.dateObservation}-${entry.motifObservation}`">
                      <td>{{ formatDate(entry.dateObservation) }}</td>
                      <td>{{ entry.codeColonne }}</td>
                      <td>{{ entry.totalObtenu ?? '-' }}</td>
                      <td>{{ entry.maximumGeneral ?? '-' }}</td>
                      <td>{{ entry.pourcentage ?? '-' }}</td>
                      <td>{{ entry.rang ?? '-' }}</td>
                      <td>
                        <span :class="entry.estEtatCourant ? 'status-chip status-chip--ok' : 'status-chip status-chip--neutral'">
                          {{ entry.estEtatCourant ? 'Oui' : 'Non' }}
                        </span>
                      </td>
                      <td>{{ entry.motifObservation }}</td>
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
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  Printer,
  Search,
  Sheet,
  ShieldCheck,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { useStudentResultDetailViewModel } from '../viewmodels/useStudentResultDetailViewModel';

const {
  context,
  session,
  detailStore,
  anneeScolaireLabelInput,
  idClassePedagogiqueInput,
  classeLabelInput,
  sectionLabelInput,
  idEleveInput,
  eleveLabelInput,
  codeColonneInput,
  columnOptions,
  isAuthorized,
  detail,
  canLoad,
  activeColumnLabel,
  actorScopeMessage,
  technicalErrorMessage,
  uiState,
  synchroniserDepuisRoute,
  reinitialiserFiltres,
  chargerDetail,
  exporterCsv,
  ouvrirVersionPdf,
  imprimerPage,
  formatDate,
} = useStudentResultDetailViewModel();
</script>

<style src="./DetailResultatEleveView.css" scoped></style>
