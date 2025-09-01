import { ref } from 'vue'

const theme = ref<'wuhan' | 'national'>('wuhan')

export function useTheme() {
	function setTheme(next: 'wuhan' | 'national') {
		theme.value = next
	}
	return { theme, setTheme }
} 