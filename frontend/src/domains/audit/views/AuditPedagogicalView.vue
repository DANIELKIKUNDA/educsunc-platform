<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-AUD-005"
      :title="pageTitle"
      description="Lecture d audit pédagogique strictement ouverte depuis un objet métier réel: fiche, conduite, bulletin ou classement."
    >
      <template #actions>
        <div class="audit-actions">
          <RouterLink class="audit-pill" to="/app/audit"><ArrowLeft /><span>Retour audit</span></RouterLink>
          <button class="audit-secondary-action" type="button" :disabled="entries.length === 0" @click="exporterCsv"><Sheet /><span>CSV</span></button>
          <button class="audit-primary-action" type="button" @click="imprimerPage"><Printer /><span>Imprimer</span></button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Périmètre pédagogique" description="Le frontend n invente jamais un audit pédagogique global hors objet.">
      <div class="audit-hero-strip">
        <div class="audit-hero-strip__lead">
          <div class="audit-hero-strip__icon"><BookOpenCheck /></div>
          <div><p class="audit-hero-strip__label">Acteur attendu</p><strong>{{ session.actorLabel }}</strong></div>
        </div>
        <div class="audit-context-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="École" :value="context.schoolName" />
          <ContextBadge label="Section" :value="context.sectionName" />
          <ContextBadge label="Famille" :value="currentKindLabel" />
        </div>
      </div>
      <div class="audit-info-banner">
        <ShieldCheck />
        <p>{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.audit.access">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement audit pédagogique" message="Lecture des traces pédagogiques de l objet sélectionné en cours." />
      </template>
      <template v-else-if="uiState === 'error'">
        <ErrorState title="Audit pédagogique indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisée"
          message="Cette vue n est pas ouverte à un ENSEIGNANT simple non titulaire."
        />
        <template v-else>
          <SectionBlock title="Objet pédagogique réel" description="Les identifiants demandés sont exactement ceux exigés par les routes backend.">
            <div class="audit-tabs">
              <button v-for="kind in kinds" :key="kind.code" class="audit-tab" :class="{ 'audit-tab--active': currentKind === kind.code }" type="button" @click="changerFamille(kind.code)">
                {{ kind.label }}
              </button>
            </div>
            <div class="audit-filter-grid">
              <label v-if="currentKind === 'cotes'" class="audit-field audit-field--full">
                <span>Id fiche de cotation élève cours</span>
                <input v-model="idFicheInput" type="text" placeholder="idFicheCotationEleveCours" />
              </label>
              <label v-if="currentKind === 'conduite'" class="audit-field audit-field--full">
                <span>Id résultat bulletin élève</span>
                <input v-model="idResultatInput" type="text" placeholder="idResultatBulletinEleve" />
              </label>
              <label v-if="currentKind === 'bulletins'" class="audit-field audit-field--full">
                <span>Id bulletin élève</span>
                <input v-model="idBulletinInput" type="text" placeholder="idBulletinEleve" />
              </label>
              <template v-if="currentKind === 'classements'">
                <label class="audit-field">
                  <span>Id classe pédagogique</span>
                  <input v-model="idClasseInput" type="text" placeholder="idClassePedagogique" />
                </label>
                <label class="audit-field">
                  <span>Id année scolaire</span>
                  <input v-model="idAnneeInput" type="text" placeholder="idAnneeScolaire" />
                </label>
                <label class="audit-field">
                  <span>Code colonne</span>
                  <input v-model="codeColonneInput" type="text" placeholder="TOTAL_GENERAL" />
                </label>
              </template>
            </div>
            <div class="audit-actions-row">
              <button class="audit-primary-action" type="button" :disabled="!isFilterReady" @click="charger">Charger</button>
              <button class="audit-secondary-action" type="button" @click="reinitialiserFiltres">Réinitialiser</button>
            </div>
            <div class="audit-guard-panel">
              <ul>
                <li>TITULAIRE reste borné à sa classe et à la bonne année scolaire.</li>
                <li>Les acteurs sectionnels restent bornés à leur section réelle.</li>
                <li>Le frontend n ouvre pas un audit disciplinaire ou bulletin global hors objet.</li>
              </ul>
            </div>
          </SectionBlock>

          <SectionBlock title="Journal d actions pédagogiques" :description="currentKindDescription">
            <EmptyState v-if="entries.length === 0" title="Aucune trace pédagogique" message="Renseignez un objet métier réel puis chargez son audit." />
            <div v-else class="audit-table-shell">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Action</th><th>Catégorie</th><th>Acteur</th><th>Ressource</th><th>Horodatage</th><th>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in entries" :key="entry.id">
                    <td>{{ entry.action }}</td>
                    <td>{{ entry.category }}</td>
                    <td>{{ entry.actor }}</td>
                    <td>{{ entry.resource }}</td>
                    <td>{{ entry.timestamp }}</td>
                    <td>{{ entry.comment }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ArrowLeft, BookOpenCheck, Printer, Sheet, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import {
  authorizedPedagogicalAuditActors,
  serializeAuditTableRows,
  type AuditPedagogicalFilters,
} from '../models/audit.model';
import { usePedagogicalAuditStore, type PedagogicalAuditKind } from '../stores/pedagogical-audit.store';

const route = useRoute();
const router = useRouter();
const session = sessionStore.state;
const context = activeContextStore.state;
const store = usePedagogicalAuditStore();
const kinds = [
  { code: 'cotes', label: 'Audit cotes' },
  { code: 'conduite', label: 'Audit conduite' },
  { code: 'bulletins', label: 'Audit bulletins' },
  { code: 'classements', label: 'Audit classements' },
] as const;

const idFicheInput = ref('');
const idResultatInput = ref('');
const idBulletinInput = ref('');
const idClasseInput = ref('');
const idAnneeInput = ref('');
const codeColonneInput = ref('TOTAL_GENERAL');

const currentKind = computed<PedagogicalAuditKind>(() => {
  const segment = route.path.split('/').pop();
  if (segment === 'conduite' || segment === 'bulletins' || segment === 'classements') {
    return segment;
  }
  return 'cotes';
});
const currentKindLabel = computed(() => kinds.find((kind) => kind.code === currentKind.value)?.label ?? 'Audit pédagogique');
const isAuthorized = computed(() => authorizedPedagogicalAuditActors.includes(session.actorCode as never));
const uiState = computed(() => store.state.status);
const technicalErrorMessage = computed(() => store.state.errorMessage ?? 'Le backend n a pas pu restituer l audit pédagogique demandé.');
const entries = computed(() => store.state[currentKind.value]);
const pageTitle = computed(() => currentKindLabel.value);
const currentKindDescription = computed(() => {
  switch (currentKind.value) {
    case 'conduite':
      return 'Lecture de l audit de conduite pour un résultat bulletin élève réel.';
    case 'bulletins':
      return 'Lecture de l historique d audit de génération bulletin.';
    case 'classements':
      return 'Lecture de l historique de recalcul des classements d une classe réelle.';
    default:
      return 'Lecture des traces d encodage et modification des cotes.';
  }
});
const perimeterMessage = computed(() =>
  'La classe, la section, l école et l année scolaire sont résolues depuis l objet pédagogique visé. Aucun audit pédagogique global n est créé côté frontend.',
);
const isFilterReady = computed(() => {
  switch (currentKind.value) {
    case 'conduite':
      return idResultatInput.value.trim().length > 0;
    case 'bulletins':
      return idBulletinInput.value.trim().length > 0;
    case 'classements':
      return idClasseInput.value.trim().length > 0 && idAnneeInput.value.trim().length > 0;
    default:
      return idFicheInput.value.trim().length > 0;
  }
});

function lireQuery(name: string): string {
  const value = route.query[name];
  return typeof value === 'string' ? value : '';
}

function synchroniserDepuisRoute(): void {
  idFicheInput.value = lireQuery('idFicheCotationEleveCours');
  idResultatInput.value = lireQuery('idResultatBulletinEleve');
  idBulletinInput.value = lireQuery('idBulletinEleve');
  idClasseInput.value = lireQuery('idClassePedagogique');
  idAnneeInput.value = lireQuery('idAnneeScolaire');
  codeColonneInput.value = lireQuery('codeColonne') || 'TOTAL_GENERAL';
}

function construireFiltres(): AuditPedagogicalFilters {
  return {
    idFicheCotationEleveCours: idFicheInput.value.trim() || undefined,
    idResultatBulletinEleve: idResultatInput.value.trim() || undefined,
    idBulletinEleve: idBulletinInput.value.trim() || undefined,
    idClassePedagogique: idClasseInput.value.trim() || undefined,
    idAnneeScolaire: idAnneeInput.value.trim() || undefined,
    codeColonne: codeColonneInput.value.trim() || undefined,
  };
}

async function charger(): Promise<void> {
  if (!isAuthorized.value || !isFilterReady.value) {
    return;
  }

  const filtres = construireFiltres();
  await router.replace({ query: { ...route.query, ...filtres } });
  await store.charger(currentKind.value, filtres);
}

function reinitialiserFiltres(): void {
  idFicheInput.value = '';
  idResultatInput.value = '';
  idBulletinInput.value = '';
  idClasseInput.value = '';
  idAnneeInput.value = '';
  codeColonneInput.value = 'TOTAL_GENERAL';
  store.reinitialiser();
}

function changerFamille(kind: PedagogicalAuditKind): void {
  void router.push(`/app/audit/pedagogique/${kind}`);
}

function exporterCsv(): void {
  const csv = serializeAuditTableRows(
    entries.value.map((entry) => ({
      id: entry.id,
      raw: entry.raw,
      columns: {
        action: entry.action,
        categorie: entry.category,
        acteur: entry.actor,
        ressource: entry.resource,
        horodatage: entry.timestamp,
        commentaire: entry.comment,
      },
    })),
  );
  if (!csv) {
    return;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `audit-pedagogique-${currentKind.value}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function imprimerPage(): void {
  window.print();
}

synchroniserDepuisRoute();
if (isFilterReady.value) {
  void charger();
}
</script>

<style scoped src="../../../styles/shell-audit.css"></style>
