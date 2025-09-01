import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	base: '/MyClass/',  // 👈 注意这里要和仓库名一致
	server: { port: 5173, open: false },
	preview: { port: 5173 }
})