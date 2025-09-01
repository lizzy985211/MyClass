<template>
	<div class="card">
		<div class="row" style="justify-content: space-between; margin-bottom: 8px;">
			<div class="row">
				<label>学生</label>
				<select v-model="selectedId" @change="renderChart">
					<option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
				</select>
			</div>
		</div>
		<div ref="chartRef" style="height:360px;"></div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { loadSchoolData } from '../utils/dataLoader'

const route = useRoute()
const raw = ref(null)
const students = ref([])
const selectedId = ref('')
const chartRef = ref(null)
let chart

async function fetchData() {
	const school = route.params.school
	raw.value = await loadSchoolData(school)
	const grade = route.params.grade
	const klass = route.params.klass
	const subject = route.params.subject
	const path = raw.value?.data?.[grade]?.[klass]?.[subject]
	const list = path?.examList || []
	students.value = list.map(x => ({ id: x.id, name: x.name }))
	if (students.value.length && !selectedId.value) selectedId.value = students.value[0].id
	renderChart()
}

function renderChart() {
	if (!chart) {
		chart = echarts.init(chartRef.value)
	}
	if (!raw.value) return
	const grade = route.params.grade
	const klass = route.params.klass
	const subject = route.params.subject
	const path = raw.value?.data?.[grade]?.[klass]?.[subject]
	const list = path?.examList || []
	const one = list.filter(x => x.id === selectedId.value).sort((a,b)=> new Date(a.date) - new Date(b.date))
	const option = {
		title: { text: '个人成绩趋势' },
		xAxis: { type: 'category', data: one.map(x => x.date) },
		yAxis: { type: 'value' },
		tooltip: { trigger: 'axis' },
		series: [{ name: '分数', type: 'line', data: one.map(x => x.score) }]
	}
	chart.setOption(option)
}

onMounted(fetchData)
watch(() => route.fullPath, fetchData)
</script> 