<template>
  <PageContainer>
    <PageHeader eyebrow="ACA-04" title="Classes pedagogiques" description="Structure scolaire locale: creation, liste, renommage, desactivation, archivage et lecture des regles de frais." />
    <AccessBoundary page-code="ACA-LOC-002">
      <ErrorState v-if="!isAuthorized" title="Acces non autorise" message="Cette structure locale reste reservee a l administrateur systeme ecole." />
      <template v-else>
        <SectionBlock title="Creation de classe pedagogique" description="Ouverture locale a partir d une classe academique deja existante.">
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id ecole</span><input v-model="idEcoleInput" type="text" /></label>
            <label class="academique-field"><span>Id annee scolaire</span><input v-model="idAnneeScolaireInput" type="text" /></label>
            <label class="academique-field"><span>Id classe academique</span><input v-model="creation.idClasseAcademique" type="text" /></label>
            <label class="academique-field"><span>Code</span><input v-model="creation.code" type="text" /></label>
            <label class="academique-field"><span>Libelle</span><input v-model="creation.libelle" type="text" /></label>
            <label class="academique-field"><span>Suffixe parallele</span><input v-model="creation.suffixeParallele" type="text" /></label>
            <label class="academique-field"><span>Capacite accueil</span><input v-model="creation.capaciteAccueil" type="number" min="0" /></label>
            <label class="academique-field"><span>Utilisateur trace</span><input v-model="traceUtilisateur" type="text" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canCreate" @click="creer">Creer</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !idEcoleInput.trim() || !idAnneeScolaireInput.trim()" @click="chargerListe">Lister</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Classes pedagogiques" message="Lecture ou mutation des classes pedagogiques en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Operation impossible" :message="store.state.errorMessage ?? 'Operation impossible.'" />

        <SectionBlock v-if="store.state.reglesFrais" title="Regles de frais de la classe" description="Lecture backend brute du rattachement financier de la classe pedagogique.">
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.reglesFrais, null, 2) }}</pre>
        </SectionBlock>

        <SectionBlock title="Classes locales" description="La liste sert de point d entree pour les mutations reelles exposees par le backend.">
          <EmptyState v-if="store.state.entries.length === 0" title="Aucune classe chargee" message="Chargez la liste de l ecole et de l annee scolaire." />
          <div v-else class="academique-table-shell">
            <table class="academique-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libelle</th>
                  <th>Classe academique</th>
                  <th>Capacite</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="classe in store.state.entries" :key="classe.id">
                  <td>{{ classe.code }}</td>
                  <td>{{ classe.libelle }}</td>
                  <td>{{ classe.idClasseAcademique }}</td>
                  <td>{{ classe.capaciteAccueil ?? '-' }}</td>
                  <td>{{ classe.active ? 'Oui' : 'Non' }}</td>
                  <td>
                    <div class="academique-inline-actions">
                      <button class="academique-link-action" type="button" @click="chargerRegles(classe.id)">Regles frais</button>
                      <button class="academique-link-action" type="button" @click="renommer(classe.id)">Renommer</button>
                      <button class="academique-link-action" type="button" @click="desactiver(classe.id)">Desactiver</button>
                      <button class="academique-link-action" type="button" @click="archiver(classe.id)">Archiver</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useClassesPedagogiquesStore } from '../stores/classes-pedagogiques.store';

const store = useClassesPedagogiquesStore();
const tenantContext = tenantContextStore.state;
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-LOC-002');
const idEcoleInput = ref(tenantContext.schoolId);
const idAnneeScolaireInput = ref('');
const traceUtilisateur = ref(tenantContext.userId);

const creation = reactive({
  idClasseAcademique: '',
  code: '',
  libelle: '',
  suffixeParallele: '',
  capaciteAccueil: '',
});

const canCreate = computed(() =>
  idEcoleInput.value.trim()
  && idAnneeScolaireInput.value.trim()
  && creation.idClasseAcademique.trim()
  && creation.code.trim()
  && creation.libelle.trim()
  && traceUtilisateur.value.trim(),
);

async function chargerListe(): Promise<void> {
  await store.chargerListe(idEcoleInput.value.trim(), idAnneeScolaireInput.value.trim());
}

async function creer(): Promise<void> {
  await store.creer({
      idEcole: idEcoleInput.value.trim(),
      idAnneeScolaire: idAnneeScolaireInput.value.trim(),
      idClasseAcademique: creation.idClasseAcademique.trim(),
      code: creation.code.trim(),
      libelle: creation.libelle.trim(),
      suffixeParallele: creation.suffixeParallele.trim() || undefined,
      capaciteAccueil: creation.capaciteAccueil.trim() ? Number.parseInt(creation.capaciteAccueil, 10) : undefined,
      creePar: traceUtilisateur.value.trim(),
  });
  await chargerListe();
}

async function chargerRegles(idClassePedagogique: string): Promise<void> {
  await store.chargerRegles(idClassePedagogique);
}

async function renommer(idClassePedagogique: string): Promise<void> {
  const cible = store.state.entries.find((item) => item.id === idClassePedagogique);
  if (!cible) return;
  await store.renommer(idClassePedagogique, `${cible.libelle} ajuste`, traceUtilisateur.value.trim());
  await chargerListe();
}

async function desactiver(idClassePedagogique: string): Promise<void> {
  await store.desactiver(idClassePedagogique, traceUtilisateur.value.trim());
  await chargerListe();
}

async function archiver(idClassePedagogique: string): Promise<void> {
  await store.archiver(idClassePedagogique, traceUtilisateur.value.trim());
  await chargerListe();
}
</script>

<style scoped>
.academique-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row,.academique-inline-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action,.academique-secondary-action,.academique-link-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-secondary-action,.academique-link-action{background:#fff;color:#11283f}
.academique-primary-action:disabled,.academique-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-table-shell{overflow:auto}
.academique-table{width:100%;border-collapse:collapse}
.academique-table th,.academique-table td{padding:.85rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.academique-table th{font-size:.84rem;text-transform:uppercase;color:#5e7385}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
