<template>
	<div class="app-root">
		<TheHeader />
		<router-view />
	</div>
</template>

<script setup>
import TheHeader from './components/layout/TheHeader.vue'
</script>

<style scoped>
.app-root {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}
</style>