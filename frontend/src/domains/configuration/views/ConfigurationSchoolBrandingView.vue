<template>
  <ConfigurationWorkspaceView
    screen-code="SCR-CFG-004"
    title="Branding ecole"
    description="Identite documentaire locale, bornee au prefixe branding.* et a l ecole active."
    scope-level="SCHOOL"
    key-prefix-default="branding."
    default-key="branding.footer"
    value-placeholder="College Saint Raphael"
    :allow-delete="false"
    :allow-lock="true"
    :allow-snapshots="true"
    :allow-propagate="true"
    :allow-reload="false"
  />
</template>

<script setup lang="ts">
import ConfigurationWorkspaceView from './ConfigurationWorkspaceView.vue';
</script>

