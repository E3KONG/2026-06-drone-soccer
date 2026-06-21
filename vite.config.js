import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  // 部署到 GitHub Pages 的子路徑；本機 dev 不受影響
  base: '/2026-06-drone-soccer/',
  plugins: [svelte()],
})
