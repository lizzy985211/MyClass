<template>
	<header class="card" style="position: sticky; top: 0; z-index: 10;">
		<div class="container">
			<div class="row" style="justify-content: center;">
				<label>学校</label>
				<select v-model="selectedSchool" @change="onSchoolChange">
					<option v-for="s in schools" :key="s.id" :value="s.id">{{ s.name }}</option>
				</select>
				<label>年级</label>
				<select v-model="selectedGrade" @change="onGradeChange">
					<option v-for="g in grades" :key="g" :value="g">{{ gradeLabel(g) }}</option>
				</select>
				<label>班级</label>
				<select v-model="selectedClass" @change="onClassChange">
					<option v-for="c in classes" :key="c" :value="c">{{ classLabel(c) }}</option>
				</select>
			</div>
		</div>
	</header>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSchoolsIndex, getSchoolMeta } from '../../utils/dataLoader'

const router = useRouter()
const route = useRoute()

const schools = ref([])
const grades = ref([])
const classes = ref([])

const selectedSchool = ref('default')
const selectedGrade = ref('grade1')
const selectedClass = ref('class1')

async function loadSchools() {
	schools.value = await getSchoolsIndex()
}

async function refreshGradeClassOptions() {
	const meta = await getSchoolMeta(selectedSchool.value)
	grades.value = meta.grades
	classes.value = meta.classes
	// 默认选择第一个年级和班级
	if (!grades.value.includes(selectedGrade.value)) selectedGrade.value = grades.value[0]
	if (!classes.value.includes(selectedClass.value)) selectedClass.value = classes.value[0]
}

function gradeLabel(key) {
	const m = key.match(/^grade(\d+)$/)
	if (!m) return key
	const map = { '1': '一年级','2': '二年级','3': '三年级','4': '四年级','5': '五年级','6': '六年级' }
	return map[m[1]] || key
}
function classLabel(key) {
	const m = key.match(/^class(\d+)$/)
	if (!m) return key
	const num = m[1]
	const cnMap = { '1': '一','2': '二','3': '三','4': '四','5': '五','6': '六','7': '七','8': '八','9': '九','10': '十' }
	const cn = cnMap[num] || num
	return `${cn}班`
}

function pushRoute() {
	const subject = route.params.subject || 'chinese'
	const examTab = route.params.examTab || 'exam1'
	const subtab = route.params.subtab || 'classes'
	router.push({ path: `/school/${selectedSchool.value}/grade/${selectedGrade.value}/class/${selectedClass.value}/subject/${subject}/exam/${examTab}${examTab==='points'?'':`/subtab/${subtab}`}` })
}

function onSchoolChange() { refreshGradeClassOptions().then(pushRoute) }
function onGradeChange() { pushRoute() }
function onClassChange() { pushRoute() }

onMounted(async () => {
	await loadSchools()
	if (route.params.school) {
		selectedSchool.value = route.params.school
		selectedGrade.value = route.params.grade
		selectedClass.value = route.params.klass
	}
	await refreshGradeClassOptions()
	// 确保有默认选择后立即推送路由
	if (selectedGrade.value && selectedClass.value) {
		pushRoute()
	}
})

watch(() => route.params, () => {
	if (route.params.school) {
		selectedSchool.value = route.params.school
		selectedGrade.value = route.params.grade
		selectedClass.value = route.params.klass
	}
})
</script> 