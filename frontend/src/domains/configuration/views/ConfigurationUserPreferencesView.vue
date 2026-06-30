<template>
  <ConfigurationWorkspaceView
    screen-code="SCR-CFG-006"
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
import ConfigurationWorkspaceView from './ConfigurationWorkspaceView.vue';
</script>

