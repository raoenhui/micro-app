import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import legacy from '@vitejs/plugin-legacy'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, AntDesignVueResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import UnoCSS from 'unocss/vite'

const pathSrc = path.resolve(__dirname, 'src')
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
      '@micro-zoe/micro-app':path.resolve(__dirname, '../../../lib/index.esm.js')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`,
      },
    },
  },
  plugins: [
    // legacy({
    //   targets: ['Chrome >= 59']
    // }),
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // AntDesignVueResolver(), // need it?
      ],
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ]
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
        AntDesignVueResolver(),
        NaiveUiResolver(),
      ],
    }),
    ElementPlus(),
    UnoCSS(),
  ],
  server: {
    port: 7002,
    host: true,
    proxy: {
      '/sugrec': {
        target: 'https://www.baidu.com',
        secure: false,
        changeOrigin: true,
      }
    },
     // Allow services to be provided for non root directories of projects
     fs: {
      strict: false
    },
  },
  build: {
    outDir: 'vite4',
  },
  clearScreen: false,
  base: `/micro-app/vite4/`
})
