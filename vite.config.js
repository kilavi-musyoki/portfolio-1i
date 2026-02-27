import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const isGhPages = process.env.GITHUB_PAGES === 'true'

  return {
    // GitHub Pages serves project sites under /<repo>/
    base: isGhPages ? '/raged/' : '/',
    plugins: [react()],
  }
})
