import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{ path: '/', redirect: '/school/default/grade/grade1/class/class1/subject/chinese/exam/exam1/subtab/classes' },
	{
		path: '/school/:school/grade/:grade/class/:klass',
		component: () => import('../views/ShellView.vue'),
		children: [
			{
				path: 'subject/:subject',
				component: () => import('../views/SubjectTabs.vue'),
				children: [
					{
						path: 'exam/points/pointsTab/:pointsTab',
						name: 'Points',
						component: () => import('../views/PointsView.vue')
					},
					{
						path: 'exam/:examTab',
						component: () => import('../views/ExamTabs.vue'),
						children: [
							{ path: 'subtab/classes', name: 'ClassList', component: () => import('../views/ClassListView.vue') },
							{ path: 'subtab/personal', name: 'PersonalTrend', component: () => import('../views/PersonalTrendView.vue') },
							{ path: 'subtab/quality', name: 'QualityAnalysis', component: () => import('../views/QualityAnalysisView.vue') }
						]
					}
				]
			}
		]
	}
]

const router = createRouter({ history: createWebHistory(), routes })
export default router