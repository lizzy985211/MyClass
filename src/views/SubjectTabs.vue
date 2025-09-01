<template>
	<div class="nav-wrapper">
		<div class="nav-container">
			<a v-for="s in subjects" :key="s.key" href="javascript:void(0);" :class="['nav-link', activeSubject===s.key?'active':'']" @click="goSubject(s.key)">{{ s.label }}</a>
		</div>
	</div>
	<router-view />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const subjects = [
	{ key: 'chinese', label: '语文' },
	{ key: 'math', label: '数学' },
	{ key: 'english', label: '英语' }
]

const activeSubject = computed(() => route.params.subject || 'chinese')

function goSubject(subject) {
	router.push({
		path: `/school/${route.params.school}/grade/${route.params.grade}/class/${route.params.klass}/subject/${subject}/exam/${route.params.examTab || 'exam1'}${route.params.examTab==='points'?'':`/subtab/${route.params.subtab || 'classes'}`}`
	})
}
</script> 