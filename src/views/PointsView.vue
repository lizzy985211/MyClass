<template>
	<div class="card">
		<h2 style="text-align:center;margin:0 0 10px;">学生积分管理系统</h2>
		<div class="chart-container">
			<div ref="chartRef" class="chart"></div>
		</div>
		<div class="controls">
			<div class="control-group">
				<select v-model="currentClass" @change="onClassChange" id="classSelect"></select>
				<input type="text" v-model.trim="searchKeyword" placeholder="Search name/ID" @input="onSearch" id="search" />
				<label>Add Student</label>
			</div>
			<div class="control-group">
				<input type="text" v-model.trim="addName" placeholder="Name" id="name">
				<input type="text" v-model.trim="addId" placeholder="ID" id="id">
				<select v-model="addGender" id="gender">
					<option value="男">Male</option>
					<option value="女">Female</option>
				</select>
				<button @click="showAddStudent">Add</button>
			</div>
		</div>
		<div class="controls">
			<div class="control-group">
				<input type="file" ref="fileInputRef" accept=".json" style="display:none;">
				<button @click="triggerImport">Import</button>
				<button @click="backupData">Backup</button>
				<button @click="resetAllScores">Reset All Points</button>
				<button class="action-button" id="lotteryBtn" @click="runLottery">Random Roll Call</button>
				<div class="toast" ref="toastRef" style="display:none;position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,123,255,0.9);color:#fff;padding:15px 25px;border-radius:8px;font-size:18px;z-index:1000;">提示</div>
			</div>
		</div>
		<div id="students-wrapper">
			<div id="students">
				<div v-for="st in sortedList" :key="st.id" class="student-card" :class="[st.gender==='男'?'male':'female', searchHighlight===st.id?'highlight-temp':'']" :data-id="st.id">
					<div class="rank-label">{{ st.rank || '' }}</div>
					<img class="avatar" :src="st.avatar">
					<h3>{{ st.name }}</h3>
					<div class="info-line">
						<span>Number: {{ st.id }}</span>
						<span class="points" :id="`points-${st.id}`">Score: {{ st.score }}</span>
					</div>
					<div class="btn-group">
						<button class="add" @click="updateScore(st.id,1)">+1</button>
						<button class="sub" @click="updateScore(st.id,-1)">-1</button>
						<button class="reset" @click="resetScore(st.id)">Reset</button>
						<button class="delete" @click="deleteStudent(st.id)">Delete</button>
					</div>
				</div>
			</div>
		</div>
		<audio ref="addAudio" src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"></audio>
		<audio ref="subAudio" src="https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"></audio>
	</div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'

const props = defineProps({
	activeTab: { type: String, default: 'number' }
})

const route = useRoute()

// 本地存储 key 作用域：按学校/年级/班级隔离
const storageKey = computed(() => `points:${route.params.school}:${route.params.grade}:${route.params.klass}`)

// 数据结构：{ [className]: Student[] }
const defaultClasses = ['Class 68', 'Class 69']
const state = reactive({
	studentsByClass: {},
	currentClass: defaultClasses[0],
	searchKeyword: ''
})

const addName = ref('')
const addId = ref('')
const addGender = ref('男')
const fileInputRef = ref(null)
const toastRef = ref(null)
const chartRef = ref(null)
const addAudio = ref(null)
const subAudio = ref(null)
const searchHighlight = ref('')
let chart

const currentClass = computed({
	get: () => state.currentClass,
	set: v => state.currentClass = v
})
const searchKeyword = computed({
	get: () => state.searchKeyword,
	set: v => state.searchKeyword = v
})

const surnames = ['赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨']
const givenNames = ['浩然','梓涵','子轩','宇轩','浩宇','怡然','子墨','语桐','欣怡','语汐','子萱','梓萱','雨桐','子涵','诗涵','晨曦','昊然','俊熙','思涵','沐辰']
const defaultAvatars = ['https://i.pravatar.cc/50?img=1','https://i.pravatar.cc/50?img=2','https://i.pravatar.cc/50?img=3','https://i.pravatar.cc/50?img=4','https://i.pravatar.cc/50?img=5','https://i.pravatar.cc/50?img=6']

function genInitialData() {
	const studentsByClass = {}
	defaultClasses.forEach(cls => {
		studentsByClass[cls] = []
		for (let i = 0; i < 60; i++) {
			studentsByClass[cls].push({
				id: String(i+1).padStart(2,'0'),
				name: surnames[Math.floor(Math.random()*surnames.length)] + givenNames[Math.floor(Math.random()*givenNames.length)],
				gender: Math.random() > 0.5 ? '男' : '女',
				score: Math.floor(Math.random() * 21), // 0-20 随机初始分数
				avatar: defaultAvatars[Math.floor(Math.random()*defaultAvatars.length)],
				rank: i+1
			})
		}
	})
	return studentsByClass
}

// 渲染列表：搜索时不过滤，排序按当前Tab模式
const sortedList = computed(() => {
	const list = state.studentsByClass[state.currentClass] || []
	if (props.activeTab === 'score') {
		return list.slice().sort((a,b) => b.score - a.score || Number(a.id) - Number(b.id))
	} else {
		return list.slice().sort((a,b) => Number(a.id) - Number(b.id))
	}
})

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(storageKey.value)
		if (raw) return JSON.parse(raw)
	} catch(e) {}
	return genInitialData()
}

function saveToStorage() {
	localStorage.setItem(storageKey.value, JSON.stringify(state.studentsByClass))
}

function onClassChange() {
	updateRanks(state.studentsByClass[state.currentClass])
}

function showAddStudent() {
	if (!addName.value || !addId.value) return
	const list = state.studentsByClass[state.currentClass]
	list.push({ id: addId.value, name: addName.value, gender: addGender.value, score: 0, avatar: defaultAvatars[Math.floor(Math.random()*defaultAvatars.length)] })
	updateRanks(list)
	addName.value = ''
	addId.value = ''
	saveToStorage()
}

function onSearch() {
	const kw = state.searchKeyword?.toLowerCase() || ''
	if (!kw) {
		searchHighlight.value = ''
		return
	}
	const list = state.studentsByClass[state.currentClass] || []
	const match = list.find(s => String(s.id).toLowerCase().includes(kw) || String(s.name).toLowerCase().includes(kw))
	searchHighlight.value = match ? match.id : ''
	if (match) {
		nextTick(() => {
			const card = document.querySelector(`.student-card[data-id='${match.id}']`)
			if (card) {
				card.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}
		})
	}
}

function updateRanks(list) {
	if (!Array.isArray(list)) return
	// 始终按分数降序计算排名
	list.sort((a,b) => b.score - a.score || Number(a.id) - Number(b.id))
	list.forEach((s, idx) => s.rank = idx + 1)
}

const highlightTimers = {}
const updateTimers = {}

function updateScore(id, delta) {
	const list = state.studentsByClass[state.currentClass]
	const st = list.find(s => s.id === id)
	if (!st) return

	st.score += delta
	if (st.score < 0) st.score = 0

	// 重新计算排名
	updateRanks(list)

	const pointsEl = document.getElementById(`points-${id}`)
	if (pointsEl) {
		pointsEl.textContent = `Score: ${st.score}`
		pointsEl.style.transform = 'scale(1.5)'
		setTimeout(() => pointsEl.style.transform = 'scale(1)', 200)
		if (delta > 0) addAudio.value?.play()
		if (delta < 0) subAudio.value?.play()
	}

	// Number模式：仅更新排名数字，不改变位置，短暂高亮
	if (props.activeTab === 'number') {
		list.forEach(s => {
			const c = document.querySelector(`.student-card[data-id='${s.id}']`)
			if (c) c.querySelector('.rank-label').textContent = s.rank
		})
		highlightCard(id, 250)
	} else {
		// Score模式：立即高亮放大，5秒后重新排序位置
		highlightCard(id, 5000)
		clearTimeout(updateTimers[id])
		updateTimers[id] = setTimeout(() => {
			// 触发重新渲染以更新位置
			delete updateTimers[id]
		}, 5000)
	}
	updateChart()
	saveToStorage()
}

function resetScore(id) {
	const st = state.studentsByClass[state.currentClass].find(s => s.id === id)
	if (!st) return
	if (!confirm(`确定要将 ${st.name} 的分数重置为 0 吗？`)) return
	updateScore(id, -st.score)
}

function deleteStudent(id) {
	const st = state.studentsByClass[state.currentClass].find(s => s.id === id)
	if (!st) return
	if (!confirm(`确定要删除 ${st.name} 吗？此操作无法撤销！`)) return
	state.studentsByClass[state.currentClass] = state.studentsByClass[state.currentClass].filter(s => s.id !== id)
	updateRanks(state.studentsByClass[state.currentClass])
	saveToStorage()
}

function resetAllScores() {
	if (!confirm(`确定要将 ${state.currentClass} 班所有学生的分数重置为 0 吗？此操作不可撤销！`)) return
	state.studentsByClass[state.currentClass].forEach(s => s.score = 0)
	updateRanks(state.studentsByClass[state.currentClass])
	saveToStorage()
}

function backupData() {
	const dataStr = JSON.stringify(state.studentsByClass, null, 2)
	const blob = new Blob([dataStr], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'students_backup.json'
	a.click()
	URL.revokeObjectURL(url)
	alert('备份成功，已生成 students_backup.json 文件！')
}

function triggerImport() {
	fileInputRef.value?.click()
}

function importData(file) {
	const reader = new FileReader()
	reader.onload = e => {
		try {
			const imported = JSON.parse(e.target.result)
			if (typeof imported === 'object') {
				state.studentsByClass = imported
				updateChart()
				saveToStorage()
				alert('导入成功！')
			} else {
				alert('JSON 格式不正确！')
			}
		} catch(err) {
			alert('读取 JSON 出错：' + err.message)
		}
	}
	reader.readAsText(file)
}

function showToast(msg) {
	const el = toastRef.value
	if (!el) return
	el.textContent = msg
	el.style.display = 'block'
	setTimeout(() => el.style.display = 'none', 2000)
}

function highlightCard(id, duration = 3000) {
	const card = document.querySelector(`.student-card[data-id='${id}']`)
	if (!card) return
	if (highlightTimers[id]) clearTimeout(highlightTimers[id])
	card.classList.add('highlight')
	highlightTimers[id] = setTimeout(() => {
		card.classList.remove('highlight')
		delete highlightTimers[id]
	}, duration)
}

function easeOut(t) { return 1 - Math.pow(1 - t, 2) }
let lotteryRunning = false
function runLottery() {
	if (lotteryRunning) return
	lotteryRunning = true
	const cards = Array.from(document.querySelectorAll('.student-card'))
	if (!cards.length) { lotteryRunning = false; return }
	const maxTime = 3000
	let startTime = Date.now()
	let winner
	function step() {
		const now = Date.now()
		let progress = (now - startTime) / maxTime
		if (progress > 1) progress = 1
		cards.forEach(c => c.classList.remove('highlight-temp'))
		const idx = Math.floor(Math.random() * cards.length)
		winner = cards[idx]
		winner.classList.add('highlight-temp')
		if (progress < 1) {
			requestAnimationFrame(() => {
				const nextInterval = 50 + easeOut(progress) * 100
				setTimeout(step, nextInterval)
			})
		} else {
			cards.forEach(c => c.classList.remove('highlight-temp'))
			highlightCard(winner.dataset.id, 3000)
			winner.scrollIntoView({ behavior: 'smooth', block: 'center' })
			showToast(`恭喜 ${winner.querySelector('h3').textContent} 被选中！`)
			lotteryRunning = false
		}
	}
	step()
}

function updateChart() {
	const current = state.studentsByClass[state.currentClass] || []
	const allZero = current.every(s => s.score === 0)
	const top = allZero ? [] : current.slice().sort((a,b)=> b.score - a.score).slice(0, 10)
	if (!chart) chart = echarts.init(chartRef.value)
	const option = {
		title: { text: '积分榜单', left: 'center' },
		tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
		xAxis: { type: 'category', data: top.map(s => s.name), axisLabel: { interval: 0 } },
		yAxis: { type: 'value', minInterval: 1, axisLabel: { formatter: v => Math.round(v) } },
		series: [{ type: 'bar', data: top.map(s => ({ value: s.score, itemStyle: { color: s.gender==='男' ? '#4a90e2' : '#e91e63' } })) }]
	}
	chart.setOption(option)
}

onMounted(() => {
	// 初始化数据
	state.studentsByClass = loadFromStorage()
	// 设定班级下拉
	const select = document.getElementById('classSelect')
	if (select) {
		select.innerHTML = ''
		Object.keys(state.studentsByClass).forEach(cls => {
			const opt = document.createElement('option')
			opt.value = cls
			opt.textContent = cls
			select.appendChild(opt)
		})
		select.value = state.currentClass
		select.addEventListener('change', e => { 
			state.currentClass = e.target.value
			updateRanks(state.studentsByClass[state.currentClass])
		})
	}
	// 绑定文件导入
	fileInputRef.value?.addEventListener('change', e => {
		const file = e.target.files?.[0]
		if (file) importData(file)
	})
	// 首次渲染
	updateRanks(state.studentsByClass[state.currentClass])
	updateChart()
})

watch(() => route.fullPath, () => {
	// 切换路由时按新作用域加载/保存
	state.studentsByClass = loadFromStorage()
	state.currentClass = Object.keys(state.studentsByClass)[0] || defaultClasses[0]
	updateRanks(state.studentsByClass[state.currentClass])
	updateChart()
})
</script>

<style scoped>
.chart-container {
	width: 100%;
	height: 300px;
	margin-bottom: 12px;
	background: #fff;
	border-radius: 10px;
	padding: 10px;
	box-sizing: border-box;
	overflow: hidden;
}

.chart {
	width: 100%;
	height: 100%;
}

.student-card {
	background: #fff;
	border-radius: 10px;
	padding: 10px;
	width: 160px;
	max-width: 100%;
	text-align: center;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	position: relative;
	font-size: 13px;
	transition: transform 0.5s, top 0.5s, left 0.5s, background-color 0.5s;
	box-sizing: border-box;
}

.student-card.male { border: 2px solid #4a90e2; }
.student-card.female { border: 2px solid #f06292; }
.student-card.highlight { transform: scale(1.05); background-color: #ffe082; z-index: 5; }
.student-card .rank-label { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; background: #fff; color: #000; font-weight: bold; font-size: 16px; line-height: 20px; text-align: center; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.3); }
.student-card.highlight-temp { background-color: #2196f3 !important; transition: background-color 0.1s; }

.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	margin-bottom: 5px;
	object-fit: cover;
	cursor: pointer;
}

.info-line {
	display: flex;
	justify-content: space-between;
	margin: 6px 0;
	align-items: center;
}

.info-line span {
	font-size: 12px;
	color: #555;
}

.points {
	font-weight: 700;
	font-size: 16px;
	color: #2e7d32;
}

.btn-group {
	display: flex;
	justify-content: space-between;
	margin-top: 8px;
	gap: 6px;
}

.btn-group button {
	flex: 1;
	margin: 0;
	padding: 6px 6px;
	border-radius: 4px;
	border: none;
	font-size: 12px;
	cursor: pointer;
}

.add { background: #4caf50; color: white; }
.sub { background: #f44336; color: white; }
.reset { background: #ff9800; color: white; }
.delete { background: #9e9e9e; color: white; }

@media (max-width: 768px) {
	.chart-container { height: 250px; }
	.student-card { width: 140px; }
}

@media (max-width: 480px) {
	.chart-container { height: 200px; padding: 5px; }
	.student-card { width: 280px; max-width: 90vw; }
}
</style> 