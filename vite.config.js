import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	server: { port: 5173, open: false },
	preview: { port: 5173 }
})