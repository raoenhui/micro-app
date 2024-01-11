We list the modifications required for the base application and sub-application respectively, and introduce the use of `micro-app` in detail.

### Dock Application

1. Install dependencies
```bash
npm i @micro-zoe/micro-app --save
```

2. Introduce at the entrance
```js
// index.js
import microApp from '@micro-zoe/micro-app'

microApp.start()
```

3. Assign a route to the sub-application
<!-- tabs:start -->

#### ** React **
```js
// router.js
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import MyPage from './my-page'

export default function AppRoute () {
   return (
     <BrowserRouter>
       <Switch>
         // 👇 Non-strict matching, /my-page/* all point to the MyPage page
         <Route path='/my-page'>
           <MyPage />
         </Route>
       </Switch>
     </BrowserRouter>
   )
}
```

#### ** Vue **

```js
// router.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import MyPage from './my-page.vue'

Vue.use(VueRouter)

const routes = [
   {
     // 👇 Non-strict matching, /my-page/* all point to the MyPage page
     path: '/my-page/*', // vue-router@4.x The writing method of path is: '/my-page/:page*'
     name: 'my-page',
     component: MyPage,
   },
]

export default routes
```
<!-- tabs:end -->

4. Embed sub-application in `MyPage` page
<!-- tabs:start -->

#### ** React **
```js
// my-page.js
export function MyPage () {
   return (
     <div>
       <h1>Sub-application</h1>
       // name (required): application name
       // url (required): application address, which will be automatically completed as http://localhost:3000/index.html
       // baseroute (optional): The base route assigned by the base application to the sub-application, which is the above `/my-page`
       <micro-app name='app1' url='http://localhost:3000/' baseroute='/my-page'></micro-app>
     </div>
   )
}
```

#### ** Vue **
```html
<!-- my-page.vue -->
<template>
   <div>
     <h1>Sub-application</h1>
     <!--
       name (required): application name
       url (required): application address, which will be automatically completed as http://localhost:3000/index.html
       baseroute (optional): The base route assigned by the base application to the sub-application, which is the above `/my-page`
      -->
     <micro-app name='app1' url='http://localhost:3000/' baseroute='/my-page'></micro-app>
   </div>
</template>
```
<!-- tabs:end -->

### Sub-application

1. Set up basic routing (if the base application is history routing and the sub-application is hash routing, this step can be omitted)

<!-- tabs:start -->

#### ** React **
```js
// router.js
import { BrowserRouter, Switch, Route } from 'react-router-dom'

export default function AppRoute () {
   return (
     // 👇 Set the basic route. The sub-application can obtain the baseroute issued by the base through window.__MICRO_APP_BASE_ROUTE__. If the baseroute attribute is not set, this value defaults to an empty string.
     <BrowserRouter basename={window.__MICRO_APP_BASE_ROUTE__ || '/'}>
       ...
     </BrowserRouter>
   )
}
```

#### ** Vue **
```js
// main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'

const router = new VueRouter({
   // 👇 Set the basic route. The sub-application can obtain the baseroute issued by the base through window.__MICRO_APP_BASE_ROUTE__. If the baseroute attribute is not set, this value defaults to an empty string.
   base: window.__MICRO_APP_BASE_ROUTE__ || '/',
   routes,
})

let app = new Vue({
   router,
   render: h => h(App),
}).$mount('#app')
```
<!-- tabs:end -->


2. Set cross-domain support in the headers of webpack-dev-server.
```js
devServer: {
   headers: {
     'Access-Control-Allow-Origin': '*',
   }
},
```

After completing the above steps, the micro frontend can render normally.


> [!NOTE]
> 1. The name must start with a letter and cannot contain special symbols except underscores and underlines.
>
> 2. The url is just the html address. The page rendering of the sub-application is still based on the browser address. For this point, please see [Routing Chapter] (/zh-cn/route)
>
> 3. For the function of baseroute, please see [Route Configuration] (/zh-cn/route?id=Route Configuration)
>
> 4. Sub-applications must support cross-domain access. For cross-domain configuration, please refer to [here](/zh-cn/questions?id=_2. Do sub-application static resources must support cross-domain access?)