<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-CFG-002"
      title="Configuration organisationnelle"
      description="Politiques communes et modules autorises pour l organisation active."
    >
      <template #actions>
        <div class="cfg-actions">
          <RouterLink class="cfg-pill" to="/app/configuration">
            <ArrowLeft />
            <span>Retour configuration</span>
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Modules autorises" description="Projection directe du workflow CFG-03 sur l organisation active.">
      <div class="cfg-grid">
        <label v-for="module in moduleCatalog" :key="module.code" class="cfg-module-card">
          <input v-model="selectedModules" :value="module.code" type="checkbox" />
          <div>
            <strong>{{ module.label }}</strong>
            <p>{{ module.description }}</p>
          </div>
        </label>
      </div>
      <div class="cfg-actions">
        <button class="cfg-pill cfg-pill--action" type="button" :disabled="!canMutateModules" @click="saveOrganizationModules">
          Enregistrer modules autorises
        </button>
        <button class="cfg-pill" type="button" @click="loadEffectiveModules">
          Relire modules effectifs ecole
        </button>
      </div>
      <div v-if="modulesStore.state.effective" class="cfg-banner">
        <ShieldCheck />
        <p>
          Effectif ecole {{ modulesStore.state.effective.ecoleId }} :
          {{ modulesStore.state.effective.modulesEffectifs.join(', ') || 'aucun module actif' }}.
        </p>
      </div>
    </SectionBlock>

    <ConfigurationWorkspaceView
      screen-code="SCR-CFG-002"
      title="Politiques organisationnelles"
      description="Gestion des cles organizationnelles et lecture effective sur la portee organisation."
      scope-level="ORGANIZATION"
      key-prefix-default="policies."
      default-key="policies.notifications.digest"
      value-placeholder="weekly"
      :allow-delete="true"
      :allow-lock="true"
      :allow-snapshots="true"
      :allow-propagate="true"
      :allow-reload="false"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import {
  configurationModuleCatalog,
  configurationOrganizationWriteActors,
  type ConfigurationModuleCode,
} from '../models/configuration.model';
import { useConfigurationModulesStore } from '../stores/configuration-modules.store';
import ConfigurationWorkspaceView from './ConfigurationWorkspaceView.vue';

const modulesStore = useConfigurationModulesStore();
const session = sessionStore.state;
const tenantContext = tenantContextStore.state;
const moduleCatalog = configurationModuleCatalog;
const selectedModules = ref<ConfigurationModuleCode[]>(['PAIEMENTS_FACTURATION', 'MONITORING']);

const canMutateModules = computed(() =>
  configurationOrganizationWriteActors.includes(session.actorCode as never),
);

async function saveOrganizationModules(): Promise<void> {
  await modulesStore.configurerOrganisation(tenantContext.organizationId, selectedModules.value, tenantContext.userId);
}

async function loadEffectiveModules(): Promise<void> {
  await modulesStore.resoudre(tenantContext.organizationId, tenantContext.schoolId);
}
</script>

<style scoped>
.cfg-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.cfg-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.cfg-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.cfg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.cfg-module-card{display:flex;gap:.85rem;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff;padding:1rem;box-shadow:0 18px 45px rgba(17,40,63,.08)}
.cfg-module-card p{margin:.35rem 0 0;color:#52697c;font-size:.92rem}
.cfg-banner{display:flex;gap:.75rem;align-items:flex-start;border-radius:18px;background:#f7fbfd;padding:.95rem 1rem;color:#456175;margin-top:1rem}
</style>

