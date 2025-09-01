<template>
	<div class="nav-wrapper">
		<div class="nav-container">
			<a v-for="e in examTabs" :key="e.key" href="javascript:void(0);" :class="['nav-link', activeExam===e.key?'active':'']" @click="goExam(e.key)">{{ e.label }}</a>
		</div>
	</div>
	<div v-if="activeExam!=='points'" class="nav-wrapper" style="padding-top:0;">
		<div class="nav-container">
			<a v-for="st in subTabs" :key="st.key" href="javascript:void(0);" :class="['nav-link', activeSubtab===st.key?'active':'']" @click="goSubtab(st.key)">{{ st.label }}</a>
		</div>
	</div>
	<div v-if="activeExam==='points'" class="nav-wrapper" style="padding-top:0;">
		<div class="nav-container">
			<a v-for="pt in pointsTabs" :key="pt.key" href="javascript:void(0);" :class="['nav-link', activePointsTab===pt.key?'active':'']" @click="goPointsTab(pt.key)">{{ pt.label }}</a>
		</div>
	</div>
	<div class="card">
		<PointsView v-if="activeExam==='points'" :activeTab="activePointsTab" />
		<router-view v-else />
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PointsView from './PointsView.vue'

const router = useRouter()
const route = useRoute()

const examTabs = Array.from({ length: 10 }).map((_, i) => ({ key: `exam${i+1}`, label: `考试${i+1}` }))
examTabs.push({ key: 'points', label: '积分' })

const subTabs = [
	{ key: 'classes', label: '班级列表' },
	{ key: 'personal', label: '个人排名' },
	{ key: 'quality', label: '质量分析' }
]

const pointsTabs = [
	{ key: 'number', label: 'NumberMode' },
	{ key: 'score', label: 'ScoreMode' }
]

const activeExam = computed(() => {
	if (route.params.examTab === 'points' || route.path.includes('/exam/points')) return 'points'
	return route.params.examTab || 'exam1'
})

const activeSubtab = computed(() => {
	switch (route.name) {
		case 'ClassList': return 'classes'
		case 'PersonalTrend': return 'personal'
		case 'QualityAnalysis': return 'quality'
		default: return 'classes'
	}
})

const activePointsTab = computed(() => route.params.pointsTab || 'number')

function currentSubtab() {
	switch (route.name) {
		case 'ClassList': return 'classes'
		case 'PersonalTrend': return 'personal'
		case 'QualityAnalysis': return 'quality'
		default: return 'classes'
	}
}

function goExam(examKey) {
	if (examKey === 'points') {
		router.push({ path: `/school/${route.params.school}/grade/${route.params.grade}/class/${route.params.klass}/subject/${route.params.subject}/exam/points/pointsTab/number` })
		return
	}
	const sub = currentSubtab()
	router.push({ path: `/school/${route.params.school}/grade/${route.params.grade}/class/${route.params.klass}/subject/${route.params.subject}/exam/${examKey}/subtab/${sub}` })
}

function goSubtab(subKey) {
	const examKey = activeExam.value || 'exam1'
	if (examKey === 'points') return
	router.push({ path: `/school/${route.params.school}/grade/${route.params.grade}/class/${route.params.klass}/subject/${route.params.subject}/exam/${examKey}/subtab/${subKey}` })
}

function goPointsTab(tabKey) {
	router.push({ path: `/school/${route.params.school}/grade/${route.params.grade}/class/${route.params.klass}/subject/${route.params.subject}/exam/points/pointsTab/${tabKey}` })
}
</script> 