import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import microApp from '@micro-zoe/micro-app'
import routes from './router'
import App from './App.vue'
import config from './config'

// microApp.preFetch([
//   {name: 'vite', url: `${config.vite}micro-app/vite`},
//   {name: 'vue2', url: `${config.vue2}micro-app/vue2`},
//   {name: 'react16', url: `${config.react16}micro-app/react16`},
//   {name: 'react17', url: `${config.react17}micro-app/react17`},
//   {name: 'vue3', url: `${config.vue3}micro-app/vue3`},
//   {name: 'angular11', url: `${config.angular11}micro-app/angular11`},
// ])

microApp.start()

Vue.config.productionTip = false
Vue.use(ElementUI)

const router = new VueRouter({
  // options: {
  //   base: '/micro-app/demo/',
  // },
  mode: 'history',
  routes,
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
