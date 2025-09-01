<template>
	<div class="card">
		<div ref="chartRef" style="height:360px;"></div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { loadSchoolData } from '../utils/dataLoader'

const route = useRoute()
const chartRef = ref(null)
let chart
let cache = null

async function fetchData() {
	const school = route.params.school
	cache = await loadSchoolData(school)
	renderChart()
}

function renderChart() {
	if (!chart) chart = echarts.init(chartRef.value)
	if (!cache) return
	const grade = route.params.grade
	const klass = route.params.klass
	const subject = route.params.subject
	const examTab = route.params.examTab
	const path = cache?.data?.[grade]?.[klass]?.[subject]
	const list = examTab === 'points' ? (path?.pointList || []) : (path?.examList || [])
	const buckets = [0,60,70,80,90,100]
	const dist = [0,0,0,0,0]
	let total = 0
	list.forEach(x => {
		total += Number(x.score || 0)
		const s = Number(x.score)
		if (s < 60) dist[0]++
		else if (s < 70) dist[1]++
		else if (s < 80) dist[2]++
		else if (s < 90) dist[3]++
		else dist[4]++
	})
	const avg = list.length ? (total / list.length).toFixed(1) : 0
	const option = {
		title: { text: '质量分析' },
		tooltip: { trigger: 'axis' },
		xAxis: { type: 'category', data: ['<60','60-69','70-79','80-89','90-100'] },
		yAxis: [{ type: 'value' }, { type: 'value', position: 'right', min: 0, max: 100 }],
		series: [
			{ name: '人数', type: 'bar', data: dist },
			{ name: '平均分', type: 'line', yAxisIndex: 1, data: Array(5).fill(avg) }
		]
	}
	chart.setOption(option)
}

onMounted(fetchData)
watch(() => route.fullPath, fetchData)
</script> 