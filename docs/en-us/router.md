MicroApp通过自定义location和history，实现了一套虚拟路由系统，子应用运行在这套虚拟路由系统中，和主应用的路由进行隔离，避免相互影响。

子应用的路由信息会作为query参数同步到浏览器地址上，如下：

![alt](https://img12.360buyimg.com/imagetools/jfs/t1/204018/30/36539/9736/6523add2F41753832/31f5ad7e48ea6570.png ':size=700')

虚拟路由系统还提供了丰富的功能，帮助用户提升开发效率和使用体验。

## 配置项
#### 1、关闭虚拟路由系统
虚拟路由系统是默认开启的，设置`disable-memory-router`可以进行关闭，此时子应用将基于浏览器路由进行渲染，参考[browser-router](/zh-cn/browser-router)

**使用方式：**

1、关闭某个子应用的虚拟路由
```html
<micro-app name='xx' url='xx' disable-memory-router></micro-app>
```

2、关闭所有子应用的虚拟路由
```js
import microApp from '@micro-zoe/micro-app'

// 在start中增加配置
microApp.start({
  'disable-memory-router': true, // 关闭虚拟路由
})
```

#### 2、保留路由状态
默认情况下，子应用卸载后重新渲染，将和首次加载一样渲染子应用的首页。

设置`keep-router-state`可以保留子应用路由状态，在卸载后重新渲染时将恢复卸载前的页面（页面中的状态不保留）。

**使用方式：**

1、保留某个子应用的路由状态
```html
<micro-app name='xx' url='xx' keep-router-state></micro-app>
```

2、保留所有子应用的路由状态
```js
import microApp from '@micro-zoe/micro-app'

// 在start中增加配置
microApp.start({
  'keep-router-state': true, // 保留路由状态
})
```

注意：
  1. 如果关闭了虚拟路由系统，`keep-router-state`也将失效。
  2. 当设置了`default-page`时`keep-router-state`将失效，因为它的优先级小于`default-page`



## 导航
通过虚拟路由系统，我们可以方便的进行跨应用的跳转，如：
1. 主应用控制子应用跳转
2. 子应用控制主应用跳转
3. 子应用控制其它子应用跳转

由于nextjs的路由系统非常特殊，当子应用是nextjs时无法直接控制跳转，参考[通过数据通信控制跳转](/zh-cn/jump?id=方式二、通过数据通信控制跳转)

<!-- tabs:start -->
#### ** 主应用 **


### router.push
**介绍：**控制子应用跳转，并向路由堆栈添加一条新的记录
```js
/**
 * @param {string} name 必填，子应用的name
 * @param {string} path 必填，子应用除域名外的全量地址(也可以带上域名)
 * @param {boolean} replace 可选，是否使用replace模式，不新增堆栈记录，默认为false
 */
router.push({ name: '子应用名称', path: '页面地址', replace: 是否使用replace模式 })
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 不带域名的地址，控制子应用my-app跳转/page1
microApp.router.push({name: 'my-app', path: '/page1'})

// 带域名的地址，控制子应用my-app跳转/page1
microApp.router.push({name: 'my-app', path: 'http://localhost:3000/page1'})

// 带查询参数，控制子应用my-app跳转/page1?id=9527
microApp.router.push({name: 'my-app', path: '/page1?id=9527'})

// 带hash，控制子应用my-app跳转/page1#hash
microApp.router.push({name: 'my-app', path: '/page1#hash'})

// 使用replace模式，等同于 router.replace({name: 'my-app', path: '/page1'})
microApp.router.push({name: 'my-app', path: '/page1', replace: true })
```


### router.replace
**介绍：**控制子应用跳转，但不会向路由堆栈添加新的记录，而是替换最新的堆栈记录。
```js
/**
 * @param {string} name 必填，子应用的name
 * @param {string} path 必填，子应用除域名外的全量地址(也可以带上域名)
 * @param {boolean} replace 可选，是否使用replace模式，默认为true
 */
router.replace({ name: '子应用名称', path: '页面地址', replace: 是否使用replace模式 })
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 不带域名的地址
microApp.router.replace({name: 'my-app', path: '/page1'})

// 带域名的地址
microApp.router.replace({name: 'my-app', path: 'http://localhost:3000/page1'})

// 带查询参数
microApp.router.replace({name: 'my-app', path: '/page1?id=9527'})

// 带hash
microApp.router.replace({name: 'my-app', path: '/page1#hash'})

// 关闭replace模式，等同于 router.push({name: 'my-app', path: '/page1'})
microApp.router.replace({name: 'my-app', path: '/page1', replace: false })
```


### router.go
**介绍：**它的功能和window.history.go(n)一致，表示在历史堆栈中前进或后退多少步。
```js
/**
 * @param {number} n 前进或后退多少步
 */
router.go(n)
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 返回一条记录
microApp.router.go(-1)

// 前进 3 条记录
microApp.router.go(3)
```


### router.back
**介绍：**它的功能和window.history.back()一致，表示在历史堆栈中后退一步。
```js
router.back()
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 返回一条记录
microApp.router.back()
```


### router.forward
**介绍：**它的功能和window.history.forward()一致，表示在历史堆栈中前进一步。
```js
router.forward()
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 前进一条记录
microApp.router.forward()
```


#### ** 子应用 **
子应用的路由API和主应用保持一致，不同点是`microApp`挂载在window上。

### 子应用控制主应用跳转
默认情况下，子应用无法直接控制主应用的跳转，为此我们提供了一个API，将主应用的路由对象传递给子应用。

**主应用** 
```js
import microApp from '@micro-zoe/micro-app'

// 注册主应用路由
microApp.router.setBaseAppRouter(主应用的路由对象)
```
**子应用** 
```js
// 获取主应用路由
const baseRouter = window.microApp.router.getBaseAppRouter() 

// 控制主应用跳转
baseRouter.主应用路由的方法(...) 
```

### 控制其他子应用跳转

### router.push
**介绍：**控制其它子应用跳转，并向路由堆栈添加一条新的记录
```js
/**
 * @param {string} name 必填，子应用的name
 * @param {string} path 必填，子应用除域名外的全量地址(也可以带上域名)
 * @param {boolean} replace 可选，是否使用replace模式，不新增堆栈记录，默认为false
 */
router.push({ name: '子应用名称', path: '页面地址', replace: 是否使用replace模式 })
```

**示例：**
```js
// 不带域名的地址，控制子应用my-app跳转/page1
window.microApp.router.push({name: 'my-app', path: '/page1'})

// 带域名的地址，控制子应用my-app跳转/page1
window.microApp.router.push({name: 'my-app', path: 'http://localhost:3000/page1'})

// 带查询参数，控制子应用my-app跳转/page1?id=9527
window.microApp.router.push({name: 'my-app', path: '/page1?id=9527'})

// 带hash，控制子应用my-app跳转/page1#hash
window.microApp.router.push({name: 'my-app', path: '/page1#hash'})

// 使用replace模式，等同于 router.replace({name: 'my-app', path: '/page1'})
window.microApp.router.push({name: 'my-app', path: '/page1', replace: true })
```


### router.replace
**介绍：**控制其它子应用跳转，但不会向路由堆栈添加新的记录，而是替换最新的堆栈记录。
```js
/**
 * @param {string} name 必填，子应用的name
 * @param {string} path 必填，子应用除域名外的全量地址(也可以带上域名)
 * @param {boolean} replace 可选，是否使用replace模式，默认为true
 */
router.replace({ name: '子应用名称', path: '页面地址', replace: 是否使用replace模式 })
```

**示例：**
```js
// 不带域名的地址
window.microApp.router.replace({name: 'my-app', path: '/page1'})

// 带域名的地址
window.microApp.router.replace({name: 'my-app', path: 'http://localhost:3000/page1'})

// 带查询参数
window.microApp.router.replace({name: 'my-app', path: '/page1?id=9527'})

// 带hash
window.microApp.router.replace({name: 'my-app', path: '/page1#hash'})

// 关闭replace模式，等同于 router.push({name: 'my-app', path: '/page1'})
window.microApp.router.replace({name: 'my-app', path: '/page1', replace: false })
```


### router.go
**介绍：**它的功能和window.history.go(n)一致，表示在历史堆栈中前进或后退多少步。
```js
/**
 * @param {number} n 前进或后退多少步
 */
router.go(n)
```

**示例：**
```js
// 返回一条记录
window.microApp.router.go(-1)

// 前进 3 条记录
window.microApp.router.go(3)
```


### router.back
**介绍：**它的功能和window.history.back()一致，表示在历史堆栈中后退一步。
```js
router.back()
```

**示例：**
```js
// 返回一条记录
window.microApp.router.back()
```


### router.forward
**介绍：**它的功能和window.history.forward()一致，表示在历史堆栈中前进一步。
```js
router.forward()
```

**示例：**
```js
// 前进一条记录
window.microApp.router.forward()
```
<!-- tabs:end -->



## 设置默认页面

子应用加载后会默认渲染首页，但我们常常希望子应用加载后渲染指定的页面，此时可以设置`defaultPage`指定子应用渲染的页面。

**方式一：设置default-page属性**
```html
<micro-app default-page='页面地址'></micro-app>
```

**示例：**

```html
<!-- 不带域名的地址 -->
<micro-app name='my-app' url='http://localhost:3000/' default-page='/page1'></micro-app>

<!-- 带域名的地址 -->
<micro-app name='my-app' url='http://localhost:3000/' default-page='http://localhost:3000/page1'></micro-app>

<!-- 带查询参数 -->
<micro-app name='my-app' url='http://localhost:3000/' default-page='/page1?id=9527'></micro-app>

<!-- 带hash -->
<micro-app name='my-app' url='http://localhost:3000/' default-page='/page1#hash'></micro-app>
```

**方式二：通过router API设置**
```js
/**
 * 设置子应用默认页面
 * @param {string} name 必填，子应用的name
 * @param {string} path 必填，页面地址
 */
router.setDefaultPage({ name: '子应用名称', path: '页面地址' })

/**
 * 删除子应用默认页面
 * @param {string} name 必填，子应用的name
 */
router.removeDefaultPage(name: '子应用名称')

/**
 * 获取子应用默认页面
 * @param {string} name 必填，子应用的name
 */
router.getDefaultPage(name: '子应用名称')
```

**示例：**

```js
import microApp from '@micro-zoe/micro-app'

// 不带域名的地址
microApp.router.setDefaultPage({name: 'my-app', path: '/page1'})

// 带域名的地址
microApp.router.setDefaultPage({name: 'my-app', path: 'http://localhost:3000/page1'})

// 带查询参数
microApp.router.setDefaultPage({name: 'my-app', path: '/page1?id=9527'})

// 带hash
microApp.router.setDefaultPage({name: 'my-app', path: '/page1#hash'})

// 删除子应用my-app的默认页面
router.removeDefaultPage('my-app')

// 获取子应用my-app的默认页面
const defaultPage = router.getDefaultPage('my-app')
```



## 导航守卫
导航守卫用于监听子应用的路由变化，类似于vue-router的全局守卫，不同点是MicroApp的导航守卫无法取消跳转。

#### 全局前置守卫
**介绍：**监听所有或某个子应用的路由变化，在子应用页面渲染前执行。

**使用范围：**主应用
```js
/**
 * @param {object} to 即将要进入的路由
 * @param {object} from 正要离开的路由
 * @param {string} name 子应用的name
 * @return cancel function 解绑路由监听函数
 */
router.beforeEach((to, from, name) => {} | { name: (to, from) => {} })
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 监听所有子应用的路由变化
microApp.router.beforeEach((to, from, appName) => {
  console.log('全局前置守卫 beforeEach: ', to, from, appName)
})

// 监听某个子应用的路由变化
microApp.router.beforeEach({
  子应用1name (to, from) {
    console.log('指定子应用的前置守卫 beforeEach ', to, from)
  },
  子应用2name (to, from) {
    console.log('指定子应用的前置守卫 beforeEach ', to, from)
  }
})

// beforeEach会返回一个解绑函数
const cancelCallback = microApp.router.beforeEach((to, from, appName) => {
  console.log('全局前置守卫 beforeEach: ', to, from, appName)
})

// 解绑路由监听
cancelCallback()
```


#### 全局后置守卫
**介绍：**监听所有或某个子应用的路由变化，在子应用页面渲染后执行。

**使用范围：**主应用
```js
/**
 * @param {object} to 已经进入的路由
 * @param {object} from 已经离开的路由
 * @param {string} name 子应用的name
 * @return cancel function 解绑路由监听函数
 */
router.afterEach((to, from, name) => {} | { name: (to, from) => {} })
```

**示例：**
```js
import microApp from '@micro-zoe/micro-app'

// 监听所有子应用的路由变化
microApp.router.afterEach((to, from, appName) => {
  console.log('全局后置守卫 afterEach: ', to, from, appName)
})

// 监听某个子应用的路由变化
microApp.router.afterEach({
  子应用1name (to, from) {
    console.log('指定子应用的后置守卫 afterEach ', to, from)
  },
  子应用2name (to, from) {
    console.log('指定子应用的后置守卫 beforeEach ', to, from)
  }
})

// afterEach会返回一个解绑函数
const cancelCallback = microApp.router.afterEach((to, from, appName) => {
  console.log('全局后置守卫 afterEach: ', to, from, appName)
})

// 解绑路由监听
cancelCallback()
```

## 获取路由信息
**介绍：**获取子应用的路由信息，返回值与子应用的location相同
```js
/**
 * @param {string} name 必填，子应用的name
 */
router.current.get(name)
```

**示例：**

<!-- tabs:start -->
#### ** 主应用 **

```js
import microApp from '@micro-zoe/micro-app'

// 获取子应用my-app的路由信息，返回值与子应用的location相同
const routeInfo = microApp.router.current.get('my-app')
```

#### ** 子应用 **

```js
// 获取子应用my-app的路由信息，返回值与子应用的location相同
const routeInfo = window.microApp.router.current.get('my-app')
```
<!-- tabs:end -->


## 编解码
**介绍：**子应用同步到浏览器的路由信息是经过特殊编码的(encodeURIComponent + 特殊字符转译)，如果用户想要编码或解码子应用的路由信息，可以使用编解码的API。

![alt](https://img12.360buyimg.com/imagetools/jfs/t1/204018/30/36539/9736/6523add2F41753832/31f5ad7e48ea6570.png ':size=700')

```js
/**
 * 编码
 * @param {string} path 必填，页面地址
 */
router.encode(path: string)

/**
 * 解码
 * @param {string} path 必填，页面地址
 */
router.decode(path: string)
```

**示例：**

<!-- tabs:start -->
#### ** 主应用 **

```js
import microApp from '@micro-zoe/micro-app'

// 返回 %2Fpage1%2F
const encodeResult = microApp.router.encode('/page1/')

// 返回 /page1/
const encodeResult = microApp.router.decode('%2Fpage1%2F')
```

#### ** 子应用 **

```js
// 返回 %2Fpage1%2F
const encodeResult = window.microApp.router.encode('/page1/')

// 返回 /page1/
const encodeResult = window.microApp.router.decode('%2Fpage1%2F')
```
<!-- tabs:end -->

## 同步路由信息
在一些特殊情况下，主应用的跳转会导致浏览器地址上子应用信息丢失，此时可以主动调用方法，将子应用的路由信息同步到浏览器地址上。

**介绍：**主动将子应用的路由信息同步到浏览器地址上

**使用范围：**主应用
```js
/**
 * 将指定子应用的路由信息同步到浏览器地址上
 * 如果应用未渲染或已经卸载，则方法无效
 * @param {string} name 子应用的名称
 */
router.attachToURL(name: string)

/**
 * 将所有正在运行的子应用路由信息同步到浏览器地址上
 * 它接受一个对象作为参数，详情如下：
 * @param {boolean} includeHiddenApp 是否包含已经隐藏的keep-alive应用，默认为false
 * @param {boolean} includePreRender 是否包含预渲染应用，默认为false
 */
router.attachAllToURL({
  includeHiddenApp?: boolean,
  includePreRender?: boolean,
})
```

**示例：**

```js
import microApp from '@micro-zoe/micro-app'

// 将my-app的路由信息同步到浏览器地址上
microApp.router.attachToURL('my-app')

// 将所有正在运行的子应用路由信息同步到浏览器地址上，不包含处于隐藏状态的keep-alive应用和预渲染应用
microApp.router.attachAllToURL()

// 将所有正在运行的子应用路由信息同步到浏览器地址上，包含处于隐藏状态的keep-alive应用
microApp.router.attachAllToURL({ includeHiddenApp: true })

// 将所有正在运行的子应用路由信息同步到浏览器地址上，包含预渲染应用
microApp.router.attachAllToURL({ includePreRender: true })
```
