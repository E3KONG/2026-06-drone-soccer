import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  // 相對路徑：build 後整包 dist 可放到任何路徑/網域下執行
  base: './',
  plugins: [svelte({ emitCss: false })],
})
