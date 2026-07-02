<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-CFG-003"
      title="Modules actifs de l'ecole"
      description="Activation locale des modules dans le cadre autorise par l organisation."
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

    <SectionBlock title="Activation locale" description="Le backend recalcule ensuite la resolution effective organisation plus ecole.">
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
        <button class="cfg-pill cfg-pill--action" type="button" @click="saveSchoolModules">Enregistrer modules ecole</button>
        <button class="cfg-pill" type="button" @click="loadEffectiveModules">Relire resolution effective</button>
      </div>
      <div v-if="modulesStore.state.effective" class="cfg-stack">
        <pre class="cfg-preview">{{ JSON.stringify(modulesStore.state.effective, null, 2) }}</pre>
      </div>
    </SectionBlock>

    <ConfigurationWorkspaceView
      screen-code="SCR-CFG-003"
      page-code="CFG-ECO-001"
      action-code="configuration.school.modules.manage"
      title="Configurations systeme d'ecole"
      description="Espace local de gouvernance systeme d ecole, incluant la lecture effective et les operations techniques autorisees."
      scope-level="SCHOOL"
      key-prefix-default="school."
      default-key="school.theme"
      value-placeholder="standard"
      :allow-delete="true"
      :allow-lock="true"
      :allow-snapshots="true"
      :allow-propagate="true"
      :allow-reload="true"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { configurationModuleCatalog, type ConfigurationModuleCode } from '../models/configuration.model';
import { useConfigurationModulesStore } from '../stores/configuration-modules.store';
import ConfigurationWorkspaceView from './ConfigurationWorkspaceView.vue';

const modulesStore = useConfigurationModulesStore();
const tenantContext = tenantContextStore.state;
const moduleCatalog = configurationModuleCatalog;
const selectedModules = ref<ConfigurationModuleCode[]>(['PAIEMENTS_FACTURATION']);

async function saveSchoolModules(): Promise<void> {
  await modulesStore.configurerEcole(
    tenantContext.organizationId,
    tenantContext.schoolId,
    selectedModules.value,
    tenantContext.userId,
  );
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
.cfg-stack{display:grid;gap:1rem;margin-top:1rem}
.cfg-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
