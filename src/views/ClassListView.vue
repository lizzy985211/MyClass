<template>
	<div class="card">
		<div class="row" style="justify-content: space-between; margin-bottom: 8px;">
			<div class="row">
				<strong>班级成绩列表</strong>
			</div>
			<div class="row">
				<button @click="oneKeySort">{{ sortButtonText }}</button>
				<button class="primary" @click="exportCsv">一键导出 CSV</button>
			</div>
		</div>
		<table class="table">
			<thead>
				<tr>
					<th @click="setSort('name')">姓名</th>
					<th>性别</th>
					<th @click="setSort('score')">分数</th>
					<th @click="setSort('rank')">名次</th>
					<th>考试时间</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="row in rows" :key="row.id">
					<td>{{ row.name }}</td>
					<td>{{ row.gender }}</td>
					<td>{{ row.score }}</td>
					<td>{{ row.rank }}</td>
					<td>{{ row.date }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadSchoolData } from '../utils/dataLoader'

const route = useRoute()
const raw = ref(null)
const sortKey = ref('default') // 'default' | 'score'
const sortDir = ref('desc') // 'asc' | 'desc'

const sortButtonText = computed(() => {
	if (sortKey.value === 'default') return '降序排序'
	if (sortKey.value === 'score' && sortDir.value === 'desc') return '升序排序'
	if (sortKey.value === 'score' && sortDir.value === 'asc') return '默认排序'
	return '排序'
})

async function fetchData() {
	const school = route.params.school
	raw.value = await loadSchoolData(school)
}

const rows = computed(() => {
	if (!raw.value) return []
	const grade = route.params.grade
	const klass = route.params.klass
	const subject = route.params.subject
	const examTab = route.params.examTab
	const path = raw.value?.data?.[grade]?.[klass]?.[subject]
	if (!path) return []
	let list = examTab === 'points' ? (path.pointList || []) : (path.examList || [])
	if (sortKey.value === 'default') {
		return [...list].sort((a,b) => Number((a.id||'').toString().replace(/\D/g,'')) - Number((b.id||'').toString().replace(/\D/g,'')))
	}
	const key = sortKey.value
	const dir = sortDir.value
	return [...list].sort((a,b) => {
		const v1 = a[key]
		const v2 = b[key]
		if (v1 === v2) return 0
		return (v1 > v2 ? 1 : -1) * (dir === 'asc' ? 1 : -1)
	})
})

function oneKeySort() {
	// default -> score desc -> score asc -> default
	if (sortKey.value === 'default') {
		sortKey.value = 'score'; sortDir.value = 'desc'
	} else if (sortKey.value === 'score' && sortDir.value === 'desc') {
		sortDir.value = 'asc'
	} else {
		sortKey.value = 'default'; sortDir.value = 'desc'
	}
}

function setSort(key) {
	if (key === 'rank') {
		sortKey.value = 'rank'
		sortDir.value = 'asc'
		return
	}
	if (sortKey.value === key) {
		sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
	} else {
		sortKey.value = key
		sortDir.value = key === 'score' ? 'desc' : 'asc'
	}
}

function exportCsv() {
	const header = ['name','id','gender','score','rank','date']
	const data = rows.value.map(r => header.map(h => r[h] ?? ''))
	const csv = [header.join(','), ...data.map(r => r.join(','))].join('\n')
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'class-list.csv'
	a.click()
	URL.revokeObjectURL(url)
}

onMounted(fetchData)
watch(() => route.fullPath, fetchData)
</script> 