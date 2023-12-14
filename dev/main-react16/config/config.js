// https://umijs.org/config/
const openBrowser = require('react-dev-utils/openBrowser')
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
const path = require('path');

const { REACT_APP_ENV } = process.env;
export default defineConfig({
  headScripts:[
    "https://map.qq.com/api/gljs?v=1.exp&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77",
    "https://api.map.baidu.com/api?type=webgl&v=1.0&ak=GL2PbDxzBxroNb3mmpNicLMMjNCPqG8V",
    "https://webapi.amap.com/maps?v=2.0&key=309f07ac6bc48160e80b480ae511e1e9"
  ],
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  history: {
    type: 'browser', // browser hash
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  base: '/micro-app/demo/',
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  esbuild: {},
  alias: {
    '@micro-zoe/micro-app/polyfill': path.join(__dirname, '../../../polyfill'),
    '@micro-zoe/micro-app': path.join(__dirname, '../../../lib/index.esm.js'),
  },
  outputPath: 'demo',
  publicPath: process.env.NODE_ENV === 'production' ? '/micro-app/demo/' : '/',
  chainWebpack(webpackConfig) {
    if (process.env.NODE_ENV === 'development') {
      webpackConfig.plugin('openBrowser').use({
        apply (compiler) {
          compiler.hooks.done.tap('openBrowser', () => {
            if (!openBrowser.used) {
              openBrowser.used = true
              setTimeout(() => {
                openBrowser(`http://localhost:3000/`)
              }, 1000)
            }
          })
        }
      })
    }
  },
  mfsu: {},
});
