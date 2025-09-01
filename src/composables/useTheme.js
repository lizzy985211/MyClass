import { ref } from 'vue'

const theme = ref('wuhan') // 'wuhan' | 'national'

export function useTheme() {
	function setTheme(next) {
		theme.value = next
	}
	return { theme, setTheme }
} 