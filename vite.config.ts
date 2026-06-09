import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 将大于此值的 chunk 发出警告
    chunkSizeWarningLimit: 300, // KB
    rollupOptions: {
      output: {
        // 手动分包：将稳定的 vendor 依赖拆分出来，利于缓存
        manualChunks: {
          // React 会自然保留在入口 chunk，不强制分割
          'vendor-router': ['react-router-dom'],
          'vendor-dexie': ['dexie'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
  },
})
