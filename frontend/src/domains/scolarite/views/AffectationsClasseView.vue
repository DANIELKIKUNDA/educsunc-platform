<template>
  <PageContainer>
    <PageHeader eyebrow="MS-04" title="Affectations de classe" description="Centre reel de lecture, affectation, reaffectation et desactivation dans le bon perimetre scolaire." />

    <AccessBoundary capability="module.scolarite.access">
      <ErrorState
        v-if="!isAuthorized"
        title="Affectations non autorisees"
        message="Cette vue reste reservee au caissier et aux gestionnaires pedagogiques de leur section."
      />

      <template v-else>
        <SectionBlock title="Centre d affectation" description="La vue relit maintenant les vrais eleves affectes d une classe et permet d agir sans contrat ambigu.">
          <div class="scolarite-grid">
            <label class="scolarite-field"><span>Id classe pedagogique</span><input v-model="idClassePedagogique" type="text" placeholder="classe-uuid" /></label>
            <label class="scolarite-field"><span>Id inscription scolaire</span><input v-model="idInscriptionScolaire" type="text" placeholder="inscription-uuid" /></label>
            <label class="scolarite-field"><span>Id affectation</span><input v-model="idAffectationClasse" type="text" placeholder="affectation-uuid" /></label>
            <label class="scolarite-field"><span>Version attendue</span><input v-model.number="versionAttendue" type="number" min="1" /></label>
            <label class="scolarite-field"><span>Nouvelle classe</span><input v-model="idNouvelleClassePedagogique" type="text" placeholder="classe-cible-uuid" /></label>
            <label class="scolarite-field"><span>Motif</span><input v-model="motifAffectation" type="text" placeholder="optionnel" /></label>
          </div>
          <div class="scolarite-actions">
            <button class="scolarite-primary-action" type="button" @click="chargerClasse"><Search /><span>Charger la classe</span></button>
            <button class="scolarite-secondary-action" type="button" @click="chargerAffectationActive">Lire l affectation active</button>
            <button class="scolarite-secondary-action" type="button" @click="chargerAffectationParId">Lire par id</button>
            <button class="scolarite-secondary-action" type="button" @click="affecter">Affecter</button>
            <button class="scolarite-secondary-action" type="button" @click="changerClasse">Reaffecter</button>
            <button class="scolarite-secondary-action" type="button" @click="desactiver">Desactiver</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Traitement des affectations" message="Lecture ou mutation en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Affectations indisponibles" :message="store.state.errorMessage ?? 'Le workflow ne peut pas etre ouvert.'" />

        <template v-else>
          <SectionBlock v-if="store.state.lastActionMessage" title="Derniere mutation" description="Retour immediat du workflow.">
            <div class="scolarite-feedback-banner">{{ store.state.lastActionMessage }}</div>
          </SectionBlock>

          <SectionBlock v-if="store.state.affectationActive" title="Affectation active" description="Bloc de lecture immediat de l inscription cible.">
            <div class="scolarite-kpi-grid">
              <div class="scolarite-kpi-card"><small>Id affectation</small><strong>{{ store.state.affectationActive.idAffectationClasse }}</strong></div>
              <div class="scolarite-kpi-card"><small>Classe active</small><strong>{{ store.state.affectationActive.idClassePedagogique }}</strong></div>
              <div class="scolarite-kpi-card"><small>Date</small><strong>{{ store.state.affectationActive.dateAffectation }}</strong></div>
              <div class="scolarite-kpi-card"><small>Etat</small><strong>{{ store.state.affectationActive.active ? 'Active' : 'Inactive' }}</strong></div>
            </div>
          </SectionBlock>

          <SectionBlock v-if="store.state.affectationDetail" title="Affectation ciblee" description="Lecture exacte d une affectation par son identifiant permanent.">
            <div class="scolarite-kpi-grid">
              <div class="scolarite-kpi-card"><small>Id affectation</small><strong>{{ store.state.affectationDetail.idAffectationClasse }}</strong></div>
              <div class="scolarite-kpi-card"><small>Inscription</small><strong>{{ store.state.affectationDetail.idInscriptionScolaire }}</strong></div>
              <div class="scolarite-kpi-card"><small>Classe</small><strong>{{ store.state.affectationDetail.idClassePedagogique }}</strong></div>
              <div class="scolarite-kpi-card"><small>Version</small><strong>{{ store.state.affectationDetail.version }}</strong></div>
            </div>
          </SectionBlock>

          <SectionBlock v-if="store.state.classeEleves.length > 0" title="Eleves de la classe" description="La classe reste une liste utile pour piloter les affectations.">
            <div class="scolarite-table-shell">
              <table class="scolarite-table">
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Nom complet</th>
                    <th>Sexe</th>
                    <th>Statut</th>
                    <th>Famille</th>
                    <th>Inscription</th>
                    <th>Affectation</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in store.state.classeEleves" :key="entry.idEleve">
                    <td>{{ entry.matricule }}</td>
                    <td>{{ nomComplet(entry) }}</td>
                    <td>{{ entry.sexe }}</td>
                    <td>{{ entry.statutGlobal }}</td>
                    <td>{{ entry.idFamille ?? '-' }}</td>
                    <td>{{ entry.idInscriptionScolaire }}</td>
                    <td>{{ entry.idAffectationClasse }}</td>
                    <td>{{ entry.dateAffectation }}</td>
                    <td>
                      <div class="scolarite-row-actions">
                        <button class="scolarite-link-action" type="button" @click="selectionnerLigne(entry)">Selectionner</button>
                        <button class="scolarite-link-action" type="button" @click="ouvrirAffectation(entry.idAffectationClasse)">Lire</button>
                        <button class="scolarite-link-action danger" type="button" @click="desactiverDepuisLigne(entry.idInscriptionScolaire)">Desactiver</button>
                      </div>
                    </td>
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
import { Search } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import type { EleveAffecteClasseItem } from '../models/scolarite.model';
import { authorizedAffectationsActors, construireNomComplet } from '../models/scolarite.model';
import { useAssignmentsStore } from '../stores/assignments.store';

const store = useAssignmentsStore();
const session = sessionStore.state;
const isAuthorized = computed(() => authorizedAffectationsActors.includes(session.actorCode as never));
const idClassePedagogique = ref('');
const idInscriptionScolaire = ref('');
const idAffectationClasse = ref('');
const idNouvelleClassePedagogique = ref('');
const versionAttendue = ref(1);
const motifAffectation = ref('');

function nomComplet(entry: { nom: string; postNom: string; prenom?: string }): string {
  return construireNomComplet(entry.nom, entry.postNom, entry.prenom);
}

async function chargerClasse(): Promise<void> {
  if (!idClassePedagogique.value.trim()) return;
  await store.chargerClasse(idClassePedagogique.value.trim());
}

async function chargerAffectationActive(): Promise<void> {
  if (!idInscriptionScolaire.value.trim()) return;
  await store.chargerAffectationActive(idInscriptionScolaire.value.trim());
}

async function chargerAffectationParId(): Promise<void> {
  if (!idAffectationClasse.value.trim()) return;
  await store.chargerAffectation(idAffectationClasse.value.trim());
}

async function affecter(): Promise<void> {
  if (!idInscriptionScolaire.value.trim() || !idClassePedagogique.value.trim()) return;
  await store.affecter({
    idAffectationClasse: `affectation-${Date.now()}`,
    idInscriptionScolaire: idInscriptionScolaire.value.trim(),
    idClassePedagogique: idClassePedagogique.value.trim(),
    dateAffectation: new Date().toISOString().slice(0, 10),
    motifAffectation: motifAffectation.value.trim() || undefined,
  });
  await chargerClasse();
}

async function changerClasse(): Promise<void> {
  if (!idInscriptionScolaire.value.trim() || !idNouvelleClassePedagogique.value.trim()) return;
  await store.changerClasse(idInscriptionScolaire.value.trim(), {
    idNouvelleClassePedagogique: idNouvelleClassePedagogique.value.trim(),
    motifAffectation: motifAffectation.value.trim() || undefined,
    versionAttendue: versionAttendue.value,
  });
  await chargerClasse();
}

async function desactiver(): Promise<void> {
  if (!idInscriptionScolaire.value.trim()) return;
  await store.desactiverAffectation(idInscriptionScolaire.value.trim());
  await chargerClasse();
}

function selectionnerLigne(entry: EleveAffecteClasseItem): void {
  idInscriptionScolaire.value = entry.idInscriptionScolaire;
  idAffectationClasse.value = entry.idAffectationClasse;
  idClassePedagogique.value = entry.idClassePedagogique;
  versionAttendue.value = entry.versionAffectation;
  motifAffectation.value = entry.motifAffectation ?? '';
}

async function ouvrirAffectation(id: string): Promise<void> {
  idAffectationClasse.value = id;
  await chargerAffectationParId();
}

async function desactiverDepuisLigne(id: string): Promise<void> {
  idInscriptionScolaire.value = id;
  await desactiver();
}
</script>

<style scoped>
.scolarite-grid,.scolarite-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.scolarite-field{display:grid;gap:.45rem}
.scolarite-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.scolarite-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.scolarite-primary-action,.scolarite-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600}
.scolarite-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.scolarite-kpi-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08)}
.scolarite-feedback-banner{border-radius:20px;padding:1rem 1.1rem;background:linear-gradient(135deg,#eef8f6,#f7fbf9);border:1px solid rgba(13,114,94,.18);color:#0d5a4b;font-weight:600}
.scolarite-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08)}
.scolarite-table{width:100%;border-collapse:collapse;min-width:1120px}
.scolarite-table th,.scolarite-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left}
.scolarite-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.scolarite-row-actions{display:flex;flex-wrap:wrap;gap:.5rem}
.scolarite-link-action{border:none;background:transparent;color:#0b5d7a;font-weight:700;cursor:pointer;padding:0}
.scolarite-link-action.danger{color:#b42318}
</style>
