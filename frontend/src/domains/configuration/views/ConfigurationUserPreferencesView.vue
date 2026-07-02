<template>
  <ConfigurationWorkspaceView
    screen-code="SCR-CFG-006"
    :page-code="pageCode"
    :action-code="actionCode"
    title="Preferences utilisateur"
    description="Preferences personnelles de l utilisateur courant, sans lock, propagate ni gouvernance modules."
    scope-level="USER"
    key-prefix-default="preferences."
    default-key="preferences.locale"
    value-placeholder="fr-CD"
    :allow-delete="false"
    :allow-lock="false"
    :allow-snapshots="false"
    :allow-propagate="false"
    :allow-reload="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ConfigurationWorkspaceView from './ConfigurationWorkspaceView.vue';

const route = useRoute();
const pageCode = computed(() => route.name === 'me-preferences' ? 'CFG-USER-002' : 'CFG-USER-001');
const actionCode = computed(() =>
  route.name === 'me-preferences'
    ? 'configuration.user.preferences.self'
    : 'configuration.user.preferences.manage',
);
</script>
