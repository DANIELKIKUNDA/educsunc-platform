<template>
  <PageContainer>
    <PageHeader :eyebrow="screenCode" :title="title" :description="description">
      <template #actions>
        <div class="cfg-actions">
          <RouterLink class="cfg-pill" to="/app/configuration">
            <ArrowLeft />
            <span>Retour configuration</span>
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock :title="headerTitle" :description="headerDescription">
      <div class="cfg-hero">
        <div class="cfg-hero__lead">
          <div class="cfg-hero__icon">
            <SlidersHorizontal />
          </div>
          <div>
            <h3>{{ scopeLabel }}</h3>
            <p>{{ perimeterMessage }}</p>
          </div>
        </div>
        <div class="cfg-badges">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee" :value="context.schoolYearLabel" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.configuration.access">
      <ErrorState
        v-if="!isAuthorized"
        title="Acces non autorise"
        message="Cette vue de configuration reste bornee aux acteurs et au niveau proprietaire attestes."
      />

      <template v-else>
        <SectionBlock title="Contexte cible" description="Le frontend projette la portee reelle sans fusionner des niveaux incompatibles.">
          <div class="cfg-grid">
            <label class="cfg-field">
              <span>Niveau proprietaire</span>
              <input :value="scopeLevel" type="text" disabled />
            </label>
            <label class="cfg-field">
              <span>Organisation</span>
              <input :value="scopeForm.organisationId" type="text" disabled />
            </label>
            <label class="cfg-field">
              <span>Ecole</span>
              <input :value="scopeForm.ecoleId" type="text" :disabled="scopeLevel !== 'SCHOOL' && scopeLevel !== 'USER'" />
            </label>
            <label class="cfg-field">
              <span>Utilisateur</span>
              <input :value="scopeForm.utilisateurId" type="text" :disabled="scopeLevel !== 'USER'" />
            </label>
            <label class="cfg-field">
              <span>Prefixe de lecture effective</span>
              <input v-model="keyPrefix" type="text" :placeholder="keyPrefixPlaceholder" />
            </label>
          </div>
          <div class="cfg-note">
            <ShieldCheck />
            <span>{{ keyFamilyMessage }}</span>
          </div>
        </SectionBlock>

        <SectionBlock title="Mutation et consultation" description="Toutes les actions visibles restent bornees aux routes reelles du backend.">
          <div class="cfg-form-stack">
            <div class="cfg-grid cfg-grid--wide">
              <label class="cfg-field">
                <span>Id configuration</span>
                <input v-model="configurationId" type="text" placeholder="cfg-..." />
              </label>
              <label class="cfg-field">
                <span>Cle</span>
                <input v-model="key" type="text" :placeholder="defaultKey" />
              </label>
              <label class="cfg-field cfg-field--full">
                <span>Valeur</span>
                <textarea v-model="valueRaw" rows="7" :placeholder="valuePlaceholder"></textarea>
              </label>
              <label class="cfg-field">
                <span>Snapshot source</span>
                <input v-model="snapshotSourceId" type="text" placeholder="snapshot-source" />
              </label>
              <label class="cfg-field">
                <span>Snapshot cible</span>
                <input v-model="snapshotTargetId" type="text" placeholder="snapshot-cible" />
              </label>
              <label class="cfg-field">
                <span>Lock minimal</span>
                <select v-model="lockLevel">
                  <option value="SYSTEM">SYSTEM</option>
                  <option value="ORGANIZATION">ORGANIZATION</option>
                  <option value="SCHOOL">SCHOOL</option>
                  <option value="USER">USER</option>
                </select>
              </label>
            </div>

            <div class="cfg-actions">
              <button class="cfg-pill cfg-pill--action" type="button" :disabled="!canCreate" @click="createConfiguration">Creer</button>
              <button class="cfg-pill" type="button" :disabled="!canRead" @click="loadConfiguration">Consulter</button>
              <button class="cfg-pill" type="button" :disabled="!canUpdate" @click="updateConfiguration">Mettre a jour</button>
              <button v-if="allowDelete" class="cfg-pill" type="button" :disabled="!canRead" @click="deleteConfiguration">Supprimer</button>
              <button v-if="allowLock" class="cfg-pill" type="button" :disabled="!canRead" @click="lockConfiguration">Verrouiller</button>
              <button v-if="allowLock" class="cfg-pill" type="button" :disabled="!canRead" @click="unlockConfiguration">Deverrouiller</button>
              <button class="cfg-pill" type="button" :disabled="!canValidate" @click="validateConfiguration">Valider</button>
              <button v-if="allowSnapshots" class="cfg-pill" type="button" :disabled="!canRead" @click="createSnapshot">Snapshot</button>
              <button v-if="allowSnapshots" class="cfg-pill" type="button" :disabled="!canCompareSnapshots" @click="compareSnapshots">Comparer snapshots</button>
              <button v-if="allowPropagate" class="cfg-pill" type="button" :disabled="!canRead" @click="propagateConfiguration">Propager</button>
              <button v-if="allowReload" class="cfg-pill" type="button" :disabled="!canRead" @click="reloadConfiguration">Reload</button>
              <button class="cfg-pill" type="button" @click="loadEffective">Valeur effective</button>
            </div>
          </div>
        </SectionBlock>

        <LoadingState
          v-if="store.state.status === 'loading'"
          title="Configuration en cours"
          message="Le backend relit ou mute la configuration cible."
        />
        <ErrorState
          v-else-if="store.state.status === 'error'"
          title="Action configuration impossible"
          :message="store.state.errorMessage ?? 'Le workflow configuration a echoue.'"
        />

        <template v-else>
          <SectionBlock title="Resume courant" description="Le frontend expose les projections backend sans reinterpretion parallele.">
            <div class="cfg-summary-grid">
              <div class="cfg-card">
                <small>Configuration</small>
                <strong>{{ configurationSummary }}</strong>
              </div>
              <div class="cfg-card">
                <small>Effective</small>
                <strong>{{ effectiveSummary }}</strong>
              </div>
              <div class="cfg-card">
                <small>Validation</small>
                <strong>{{ validationSummary }}</strong>
              </div>
              <div class="cfg-card">
                <small>Diff snapshots</small>
                <strong>{{ diffSummary }}</strong>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock v-if="store.state.configuration" title="Configuration chargee" description="Projection principale de la configuration gouvernee.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.configuration, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.effective" title="Valeur effective" description="Resolution effective par portee et prefixe reels.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.effective, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.validation" title="Validation" description="Resultat de validation backend pour la cle cible.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.validation, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.snapshot" title="Snapshot cree" description="Instantane backend de la configuration cible.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.snapshot, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.diff" title="Comparaison de snapshots" description="Diff officiel entre deux snapshots d une meme configuration.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.diff, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.propagation" title="Propagation demandee" description="Confirmation backend d une propagation vers les portees inferieures.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.propagation, null, 2) }}</pre>
          </SectionBlock>

          <SectionBlock v-if="store.state.reload" title="Reload demande" description="Confirmation backend d un reload runtime.">
            <pre class="cfg-preview">{{ JSON.stringify(store.state.reload, null, 2) }}</pre>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ShieldCheck, SlidersHorizontal } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import {
  configurationOrganizationActors,
  configurationOrganizationWriteActors,
  configurationPlatformActors,
  configurationPlatformWriteActors,
  configurationSchoolActors,
  type ConfigurationScopeLevel,
} from '../models/configuration.model';
import {
  buildScopeFromLevel,
  parseConfigurationValue,
  summarizeConfiguration,
  summarizeDiff,
  summarizeEffectiveConfiguration,
} from '../mappers/configuration.mapper';
import { useConfigurationCenterStore } from '../stores/configuration-center.store';

const props = defineProps<{
  screenCode: string;
  title: string;
  description: string;
  scopeLevel: ConfigurationScopeLevel;
  keyPrefixDefault: string;
  defaultKey: string;
  valuePlaceholder: string;
  allowDelete: boolean;
  allowLock: boolean;
  allowSnapshots: boolean;
  allowPropagate: boolean;
  allowReload: boolean;
}>();

const store = useConfigurationCenterStore();
const context = activeContextStore.state;
const session = sessionStore.state;
const tenantContext = tenantContextStore.state;

const scopeForm = reactive({
  organisationId: tenantContext.organizationId,
  ecoleId: tenantContext.schoolId,
  utilisateurId: tenantContext.userId,
});

const configurationId = ref('');
const key = ref(props.defaultKey);
const valueRaw = ref(props.valuePlaceholder);
const keyPrefix = ref(props.keyPrefixDefault);
const snapshotSourceId = ref('');
const snapshotTargetId = ref('');
const lockLevel = ref<ConfigurationScopeLevel>(props.scopeLevel === 'SYSTEM' ? 'SYSTEM' : props.scopeLevel);

const headerTitle = computed(() => props.title);
const headerDescription = computed(() => props.description);
const scopeLabel = computed(() => `${props.scopeLevel} | ${session.actorLabel}`);
const keyPrefixPlaceholder = computed(() => props.keyPrefixDefault || 'prefixe optionnel');

const isAuthorized = computed(() => {
  if (props.scopeLevel === 'SYSTEM') {
    return configurationPlatformActors.includes(session.actorCode as never);
  }

  if (props.scopeLevel === 'ORGANIZATION') {
    return configurationOrganizationActors.includes(session.actorCode as never);
  }

  if (props.scopeLevel === 'SCHOOL') {
    return configurationSchoolActors.includes(session.actorCode as never);
  }

  return session.isAuthenticated;
});

const perimeterMessage = computed(() => {
  if (props.scopeLevel === 'SYSTEM') {
    return 'Pilotage plateforme uniquement. SUPPORT_SYSTEME reste lecteur sans mutation implicite.';
  }

  if (props.scopeLevel === 'ORGANIZATION') {
    return 'Gouvernance bornee a l organisation active, sans mutation ecole directe depuis cet ecran.';
  }

  if (props.scopeLevel === 'SCHOOL') {
    return 'Mutation bornee a l ecole active avec respect strict de l heritage organisationnel.';
  }

  return 'Preferences reservees a l utilisateur courant, sans gouvernance modules ni runtime.';
});

const keyFamilyMessage = computed(() => {
  if (props.keyPrefixDefault.trim().length === 0) {
    return 'Cette vue couvre une famille generique de cles au niveau proprietaire courant.';
  }

  return `Cette vue reste bornee au prefixe ${props.keyPrefixDefault}.`;
});

const canCreate = computed(() => key.value.trim().length > 0 && valueRaw.value.trim().length > 0);
const canRead = computed(() => configurationId.value.trim().length > 0);
const canUpdate = computed(() => canRead.value && valueRaw.value.trim().length > 0);
const canValidate = computed(() => key.value.trim().length > 0 && valueRaw.value.trim().length > 0);
const canCompareSnapshots = computed(() =>
  canRead.value
  && snapshotSourceId.value.trim().length > 0
  && snapshotTargetId.value.trim().length > 0,
);

const configurationSummary = computed(() => summarizeConfiguration(store.state.configuration));
const effectiveSummary = computed(() => summarizeEffectiveConfiguration(store.state.effective));
const validationSummary = computed(() =>
  store.state.validation
    ? store.state.validation.valide
      ? `Valide | ${store.state.validation.warnings.length} warning(s)`
      : `Invalide | ${store.state.validation.warnings.length} warning(s)`
    : 'Aucune validation executee.',
);
const diffSummary = computed(() => summarizeDiff(store.state.diff));

function buildScope() {
  return buildScopeFromLevel(props.scopeLevel, {
    organisationId: scopeForm.organisationId,
    ecoleId: scopeForm.ecoleId,
    utilisateurId: scopeForm.utilisateurId,
  });
}

function actorId(): string {
  return tenantContext.userId;
}

async function createConfiguration(): Promise<void> {
  await store.creer({
    configurationId: configurationId.value.trim() || undefined,
    key: key.value.trim(),
    value: parseConfigurationValue(valueRaw.value),
    scope: buildScope(),
    actorId: actorId(),
  });

  configurationId.value = store.state.configuration?.identifiant ?? configurationId.value;
}

async function loadConfiguration(): Promise<void> {
  await store.consulter(configurationId.value.trim());
  if (store.state.configuration) {
    key.value = store.state.configuration.key;
    valueRaw.value = JSON.stringify(store.state.configuration.valeur, null, 2);
  }
}

async function updateConfiguration(): Promise<void> {
  await store.mettreAJour(configurationId.value.trim(), {
    value: parseConfigurationValue(valueRaw.value),
    actorId: actorId(),
  });
}

async function deleteConfiguration(): Promise<void> {
  await store.supprimer(configurationId.value.trim(), {
    actorId: actorId(),
    raison: 'Suppression demandee depuis le frontend',
  });
}

async function lockConfiguration(): Promise<void> {
  await store.verrouiller(configurationId.value.trim(), {
    niveauMinimalAutorise: lockLevel.value,
    actorId: actorId(),
    raison: 'Verrou applique depuis le frontend',
  });
}

async function unlockConfiguration(): Promise<void> {
  await store.deverrouiller(configurationId.value.trim(), {
    actorId: actorId(),
  });
}

async function validateConfiguration(): Promise<void> {
  await store.valider({
    key: key.value.trim(),
    value: parseConfigurationValue(valueRaw.value),
    scope: buildScope(),
  });
}

async function createSnapshot(): Promise<void> {
  await store.creerSnapshot(configurationId.value.trim(), {
    actorId: actorId(),
  });
}

async function compareSnapshots(): Promise<void> {
  await store.comparerSnapshots(configurationId.value.trim(), {
    sourceId: snapshotSourceId.value.trim(),
    cibleId: snapshotTargetId.value.trim(),
  });
}

async function propagateConfiguration(): Promise<void> {
  await store.propager(configurationId.value.trim(), {
    actorId: actorId(),
  });
}

async function reloadConfiguration(): Promise<void> {
  await store.recharger(configurationId.value.trim(), {
    actorId: actorId(),
    forcer: true,
  });
}

async function loadEffective(): Promise<void> {
  await store.consulterEffective({
    niveau: props.scopeLevel,
    organisationId: scopeForm.organisationId || undefined,
    ecoleId: props.scopeLevel === 'SCHOOL' || props.scopeLevel === 'USER' ? scopeForm.ecoleId || undefined : undefined,
    utilisateurId: props.scopeLevel === 'USER' ? scopeForm.utilisateurId || undefined : undefined,
    keyPrefix: keyPrefix.value.trim() || undefined,
  });
}
</script>

<style scoped>
.cfg-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.cfg-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.cfg-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.cfg-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.cfg-hero__lead{display:flex;gap:1rem;align-items:center}
.cfg-hero__icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.cfg-badges{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-start}
.cfg-grid,.cfg-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.cfg-grid--wide{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.cfg-field{display:grid;gap:.45rem}
.cfg-field--full{grid-column:1/-1}
.cfg-field input,.cfg-field textarea,.cfg-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.cfg-note{display:flex;gap:.75rem;align-items:flex-start;border-radius:18px;background:#f7fbfd;padding:.95rem 1rem;color:#456175}
.cfg-form-stack{display:grid;gap:1rem}
.cfg-summary-grid .cfg-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.cfg-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>

