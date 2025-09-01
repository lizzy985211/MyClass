const base = import.meta.env.BASE_URL

export async function getSchoolsIndex() {
	const res = await fetch(`${base}/data/index.json`)
	if (!res.ok) return []
	return res.json()
}

export async function getSchoolMeta(schoolId) {
	try {
		const res = await fetch(`${base}/data/${schoolId}.meta.json`)
		if (!res.ok) throw new Error('no meta')
		return res.json()
	} catch (e) {
		return { grades: ['grade1'], classes: ['class1'] }
	}
}

export async function loadSchoolData(schoolId) {
	const res = await fetch(`${base}data/${schoolId}.json`)
	if (!res.ok) throw new Error('无法加载学校数据')
	return res.json()
} 