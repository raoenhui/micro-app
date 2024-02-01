// import 'virtual:uno.css'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// import Antd from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.css'

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss"
import "element-plus/theme-chalk/src/message-box.scss"
import "element-plus/theme-chalk/src/notification.scss"


function handleMicroData () {
  console.log('child-vite getData:', window.microApp?.getData())

  // 监听基座下发的数据变化
  window.microApp?.addDataListener((data) => {
    console.log('child-vite addDataListener:', data)
  })

  // 向基座发送数据
  setTimeout(() => {
    window.microApp?.dispatch({ myname: 'child-vite' })
  }, 3000)
}

/* ----------------------分割线-默认模式--------------------- */
// const router = createRouter({
//   history: createWebHistory(window.__MICRO_APP_BASE_ROUTE__ || import.meta.env.BASE_URL),
//   routes,
// })

// const app = createApp(App)
// app.use(router)
// app.mount('#app')
// console.log('微应用vite渲染了 -- 默认模式')

// handleMicroData()


/* ----------------------分割线-umd模式--------------------- */
let app = null
let router = null
let history = null
// 将渲染操作放入 mount 函数
window.mount = (data) => {
  history = createWebHistory(window.__MICRO_APP_BASE_ROUTE__ || import.meta.env.BASE_URL)
  router = createRouter({
    history,
    routes,
  })

  app = createApp(App)
  app.use(router)
  // app.use(ElementPlus)
  // app.use(Antd)
  app.mount('#app')

  console.log('微应用vite渲染了 -- UMD模式', data);

  handleMicroData()
}

// 将卸载操作放入 unmount 函数
window.unmount = () => {
  app && app.unmount()
  history && history.destroy()
  app = null
  router = null
  history = null
  console.log('微应用vite卸载了 -- UMD模式');
}

// 非微前端环境直接渲染
if (!window.__MICRO_APP_ENVIRONMENT__) {
  mount()
}

/* ---------------------- micro-app 自定义全局事件 --------------------- */

window.onmount = (data) => {
  // throw new Error('sfsdfsf')
  console.log('子应用 window.onmount 事件', data)
}

window.onunmount = () => {
  // throw new Error('sfsdfsf')
  console.log('子应用 window.onunmount 事件')
}

// 监听keep-alive模式下的app状态
window.addEventListener('appstate-change', function (e) {
  console.log(`子应用${window.__MICRO_APP_NAME__}内部事件 keep-alive 状态：`, e.detail.appState)
})

window.addEventListener('unmount', function (e) {
  console.log(`子应用${window.__MICRO_APP_NAME__}内部unmount事件`)
})

// document.addEventListener("mousemove", (e) => {
//   console.log(333333333, e)
// });

/* ---------------------- 全局事件 --------------------- */
// const handleDocClick = function (event) {
//   console.log(`子应用${window.__MICRO_APP_NAME__}内部的document.addEventListener(click)绑定`, event instanceof PointerEvent)
// }
// document.addEventListener('click', handleDocClick)

// // setTimeout(() => {
// //   document.dispatchEvent(new CustomEvent('click'))
// // }, 5000);


// document.onclick = () => {
//   console.log(`子应用${window.__MICRO_APP_NAME__}内部的document.onclick绑定`)
// }

// window.addEventListener('scroll', () => {
//   console.log(`scroll event from ${window.__MICRO_APP_NAME__}`)
// }, false)

// window.addEventListener('click', (event) => {
//   console.log(`子应用${window.__MICRO_APP_NAME__}内部的window.addEventListener绑定`, event instanceof PointerEvent)
// }, false)

// setTimeout(() => {
//   console.log(222222222)
//   window.dispatchEvent(new CustomEvent('click'))
// }, 5000);

/* ---------------------- 特殊事件 --------------------- */
document.addEventListener('readystatechange', (event) => {
  console.log(`子应用${window.__MICRO_APP_NAME__} readystatechange`, event, document.readyState)
});

document.addEventListener('DOMContentLoaded', (event) => {
  console.log(`子应用${window.__MICRO_APP_NAME__} DOMContentLoaded`, event, document.readyState)
});

window.addEventListener('popstate', (e) => {
  console.log(`子应用${window.__MICRO_APP_NAME__} window.addEventListener('popstate') 触发`, e)
})

window.addEventListener('hashchange', (e) => {
  console.log(`子应用${window.__MICRO_APP_NAME__} window.addEventListener('hashchange') 触发`, e, e.newURL, e.oldURL)
})

window.onpopstate = function () {
  console.log(`子应用${window.__MICRO_APP_NAME__} window.onpopstate 触发`)
}

window.onhashchange = function () {
  console.log(`子应用${window.__MICRO_APP_NAME__} window.onhashchange 触发`)
}

/* ---------------------- 定时器 --------------------- */
// setInterval(() => {
//   console.log(`子应用${window.__MICRO_APP_NAME__}的setInterval`)
// }, 5000)

// setTimeout(() => {
//   console.log(`子应用${window.__MICRO_APP_NAME__}的setTimeout`)
// }, 5000);


/* ---------------------- 创建元素 --------------------- */
// const dynamicScript1 = document.createElement('script')
// dynamicScript1.setAttribute('type', 'module')
// // dynamicScript1.textContent = 'console.warn('inline module')'
// dynamicScript1.setAttribute('src', '//127.0.0.1:8080/js/test.js')
// dynamicScript1.onload = () => {
//   console.log('动态module加载完成了')
// }
// document.head.appendChild(dynamicScript1)

// // test excludeAssetFilter http://127.0.0.1:8080/js/defer.js
// const dynamicScript2 = document.createElement('script')
// dynamicScript2.setAttribute('src', 'http://127.0.0.1:8080/js/defer.js')
// dynamicScript2.setAttribute('defer', 'true')
// document.body.appendChild(dynamicScript2)

// // common style
// const dynamicStyle = document.createElement('style')
// document.head.appendChild(dynamicStyle)
// dynamicStyle.textContent = '.test-class { color: red }'

// common link
// const link1 = document.createElement('link')
// link1.setAttribute('rel', 'stylesheet')
// link1.setAttribute('href', 'http://127.0.0.1:8080/test.css')
// link1.onload = () => {
//   console.log('动态link加载完成了')
// }
// document.head.appendChild(link1)

// // test excludeAssetFilter http://127.0.0.1:8080/facefont.css
// const link2 = document.createElement('link')
// link2.setAttribute('rel', 'stylesheet')
// link2.setAttribute('href', 'http://127.0.0.1:8080/facefont.css')
// document.head.appendChild(link2)

// // 测试 micro-app-body 顶层元素parentNode指向 document.body
// const dynamicDiv1 = document.createElement('div')
// dynamicDiv1.innerHTML = '测试parentNode'
// document.body.appendChild(dynamicDiv1)

// setTimeout(() => {
//   console.assert(dynamicDiv1.parentNode === document.body)
//   dynamicDiv1.parentNode.removeChild(dynamicDiv1)
// }, 5000);

/* -- 测试 Element.prototype.insertAdjacentElement -- 开始 */
// const dynamicStyle2 = document.createElement('style')
// dynamicStyle2.textContent = '.test-insertAdjacentElement { color: red; }'
// document.head.appendChild(dynamicStyle2)

// const dynamicStyle3 = document.createElement('style')
// dynamicStyle3.textContent = '.test-insertAdjacentElement { color: green; }'
// dynamicStyle2.insertAdjacentElement('afterend', dynamicStyle3)

// document.head.insertAdjacentElement('afterbegin', dynamicStyle3)

// const dynamicScript3 = document.createElement('script')
// dynamicScript3.textContent = `console.log('test insertAdjacentElement')`
// dynamicStyle2.insertAdjacentElement('afterend', dynamicScript3)

// document.head.insertAdjacentElement('afterend', dynamicScript3)
/* -- 测试 Element.prototype.insertAdjacentElement -- 结束 */

/* -- 测试向非head、body中插入元素 -- 开始 */
setTimeout(() => {
  // const dynamicStyle4 = document.createElement('style')
  // dynamicStyle4.setAttribute('id', 'dynamicStyle4')
  // dynamicStyle4.textContent = '.test-custom-element-inline-style { color: red; }'
  // document.getElementById('app').children[0]?.appendChild(dynamicStyle4)

  // // const dynamicScript4 = microApp.pureCreateElement('script')
  // const dynamicScript4 = document.createElement('script')
  // dynamicScript4.textContent = `console.log('测试向非head、body中插入元素')`
  // document.getElementById('app').children[0]?.appendChild(dynamicScript4)
  // document.getElementById('app').children[0]?.insertBefore(dynamicScript4, dynamicStyle4)
  // document.getElementById('app').children[0]?.replaceChild(dynamicScript4, dynamicStyle4)
  // document.getElementById('app').children[0]?.removeChild(dynamicScript4)
  // document.getElementById('app').children[0]?.append(dynamicScript4, '1111')
  // document.getElementById('app').children[0]?.prepend(dynamicScript4, '1111')
  // document.head.prepend(dynamicScript4, '1111', undefined, {})
  // document.getElementById('app').children[0]?.append(dynamicScript4, '1111', undefined, {})
  // document.getElementById('app').children[0]?.prepend(dynamicScript4, '1111', undefined, {})
  // document.body.append(dynamicScript4, '1111', undefined, {})
}, 1000);
/* -- 测试向非head、body中插入元素 -- 结束 */


/* ---------------------- DOMParser --------------------- */
// BUG TEST: https://github.com/micro-zoe/micro-app/issues/56
// const parser = new DOMParser()
// const htmlString = `
// <div>
//   <span id='parser-id'></span>
//   <span class='parser-class'></span>
//   <i name='parser-name'></i>
// </div>
// `

// const doc = parser.parseFromString(htmlString, 'text/html')

// console.log(
//   'DOMParser querySelector',
//   doc.querySelector('#parser-id'),
//   doc.getElementById('parser-id'),
//   doc.querySelectorAll('span'),
//   doc.getElementsByClassName('parser-class'),
//   doc.getElementsByTagName('span'),
//   doc.getElementsByName('parser-name'),
// )

// setTimeout(() => {
//   const d1 = doc.createElement('div')
//   const d2 = doc.createElementNS('http://www.w3.org/1999/xhtml', 'svg')
//   const d3 = doc.createDocumentFragment()

//   console.log('DOMParser createElement', d1, d2, d3)
// }, 3000)


/* ---------------------- Image --------------------- */
// const newImg = new Image()
// newImg.src = '/micro-app/vite4/src/assets/logo.png'
// document.body.appendChild(newImg)
// newImg.setAttribute('width', '50px')


/* ---------------------- cloneNode --------------------- */
// const img2 = newImg.cloneNode(true)
// document.body.appendChild(img2)


/* ---------------------- location 跳转 --------------------- */
// 依次放开每个注释来，尽可能覆盖所有场景
setTimeout(() => {
  const baseRoute = (window.__MICRO_APP_BASE_ROUTE__ || import.meta.env.BASE_URL).replace(/\/$/, '')
  // window.microApp.location.href = 'https://www.baidu.com/' // origin不同，直接跳转页面
  // window.microApp.location.href = `${baseRoute}/element-plus`
  // window.microApp.location.href = `http://localhost:7002${baseRoute}/element-plus` // path改变，刷新浏览器
  // window.microApp.location.href = `http://localhost:7002${baseRoute}/element-plus#abc` // path不变，hash改变，不刷新浏览器，发送popstate、hashchange事件
  // window.microApp.location.href = `http://localhost:7002${baseRoute}/element-plus/` // hash从有到无，刷新浏览器
  // window.microApp.location.href = `http://localhost:7002${baseRoute}`
  // window.microApp.location.href = `http://localhost:7002${baseRoute}/` // path相同，刷新浏览器
  // window.microApp.location.href = `http://localhost:7002${baseRoute}?a=1` // search变化，刷新浏览器


  // window.microApp.location.pathname = `${baseRoute}/element-plus` // path改变，刷新浏览器
  // window.microApp.location.pathname = `${baseRoute}/element-plus#hash1` // 无法直接通过pathname修改hash的值，这里的写法是错误的，而且会导致浏览器刷新，需要完善一下
  // window.microApp.location.pathname = `${baseRoute}/element-plus?b=2`

  // window.microApp.location.search = '?c=3' // search改变，刷新浏览器
  // window.microApp.location.search = '?c=3' // search不变，刷新浏览器

  // window.microApp.location.hash = '#a' // hash改变，发送popstate、hashchange事件，不刷新浏览器
  // window.microApp.location.hash = '#a' // hash不变，不发送popstate、hashchange事件


  // window.microApp.location.assign(`${baseRoute}/element-plus`) // path改变，刷新浏览器
  // window.microApp.location.assign(`http://localhost:7002${baseRoute}/element-plus`) // path不改变，刷新浏览器
  // window.microApp.location.assign(`http://localhost:7002${baseRoute}/element-plus#abc`) // path不变，hash改变，不刷新浏览器，发送popstate、hashchange事件

  // window.microApp.location.replace(`${baseRoute}/element-plus`) // 同上
  // window.microApp.location.replace(`http://localhost:7002${baseRoute}/element-plus`) // 同上
  // window.microApp.location.replace(`http://localhost:7002${baseRoute}/element-plus#abc`) // 同上

  // window.microApp.location.reload()

  // window.history.scrollRestoration = 'manual'
}, 5000);


/* ---------------------- 接口相关 --------------------- */
/**
 * 基座和子应用都设置了/sugrec的代理，两者都可以正常拿到数据
 * 但是当走子应用的代理时，headers信息只能拿到 content-length 和 content-type(with和iframe都一样)
 * 走基座的代理时，可以拿到所有的headers头信息
 * 子应用：/sugrec，默认补全为 http://localhost:7002/sugrec
 * 主应用：http://localhost:3000/sugrec
 * 注意：！！
 * iframe环境下，会自动使用base补全fetch的地址
 */
if (process.env.NODE_ENV !== 'production') {
  fetch('/sugrec').then((res) => {
    res.headers.forEach(function(val, key) { console.log('response.headers: ', key + ': ' + val) })
    return res.json()
  }).then((data) => {
    console.log('proxy代理 https://www.baidu.com/sugrec 返回数据', data)
  })


  // const req = new XMLHttpRequest()
  // req.onreadystatechange = function () {
  //   if (req.readyState === 4 && req.status === 200) {
  //     console.log('ajax请求成功', req.response)
  //   }
  // }
  // req.open('GET', '/sugrec')
  // req.send()

  // const evtSource = new EventSource('/sugrec');

  // evtSource.onmessage = function(e) {
  //   console.log('EventSource 返回数据:', e)
  // }
}



/* ---------------------- 插件相关 --------------------- */
// vite环境下无法设置window指向proxyWindow，其值依然是iframeWindow，所以插件无法使用
// window.escapeKey1 = 'escapeKey1' // 无效，只定义在iframeWindow上
// window.escapeKey2 = 'escapeKey2' // 无效，只定义在iframeWindow上
// if (window.__MICRO_APP_ENVIRONMENT__) {
//   window.__MICRO_APP_PROXY_WINDOW__.escapeKey3 = 'escapeKey3' // 逃逸到rawWindow上
//   window.__MICRO_APP_PROXY_WINDOW__.escapeKey4 = 'escapeKey4' // 逃逸到rawWindow上
// }


// console.log('scopeProperties scopeKeySpe: ', scopeKeySpe)
// console.log('scopeProperties window.scopeKeySpe: ', window.scopeKeySpe)

// console.log('scopeProperties Vue: ', Vue)
// console.log('scopeProperties window.Vue: ', window.Vue)

// window.Vue = Vue ? Vue : 'child Vue'

// console.log('scopeProperties Vue: ', Vue)
// console.log('scopeProperties window.Vue: ', window.Vue)


/* ---------------------- 特殊操作 --------------------- */
// window.document.domain = 'localhost';
