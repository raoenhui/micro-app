import type {
  Func,
  Router,
  RouterTarget,
  navigationMethod,
  MicroLocation,
  RouterGuard,
  GuardLocation,
  AccurateGuard,
  SetDefaultPageOptions,
  AttachAllToURLParam,
  AppInterface,
} from '@micro-app/types'
import {
  encodeMicroPath,
  decodeMicroPath,
  setMicroPathToURL,
  setMicroState,
  getMicroState,
  getMicroPathFromURL,
  isRouterModeCustom,
  isRouterModeSearch,
  isRouterModePure,
} from './core'
import {
  logError,
  logWarn,
  formatAppName,
  createURL,
  isFunction,
  isPlainObject,
  useSetRecord,
  useMapRecord,
  requestIdleCallback,
  isString,
  noopFalse,
  removeDomScope,
  isObject,
} from '../../libs/utils'
import { appInstanceMap } from '../../create_app'
import { getActiveApps } from '../../micro_app'
import globalEnv from '../../libs/global_env'
import { navigateWithNativeEvent, attachRouteToBrowserURL } from './history'
import bindFunctionToRawTarget from '../bind_function'
import { updateMicroLocationWithEvent } from './event'

export interface RouterApi {
  router: Router,
  executeNavigationGuard: (appName: string, to: GuardLocation, from: GuardLocation) => void
  clearRouterWhenUnmount: (appName: string) => void
}

export interface CreteBaseRouter {
  setBaseAppRouter (baseRouter: unknown): void
  getBaseAppRouter(): unknown
}

export interface CreateDefaultPage {
  setDefaultPage(options: SetDefaultPageOptions): () => boolean
  removeDefaultPage(appName: string): boolean
  getDefaultPage(key: PropertyKey): string | void
}

function createRouterApi (): RouterApi {
  /**
   * common handler for router.push/router.replace method
   * @param appName app name
   * @param methodName replaceState/pushState
   * @param targetLocation target location
   * @param state to.state
   */
  function navigateWithRawHistory (
    appName: string,
    methodName: string,
    targetLocation: MicroLocation,
    state: unknown,
  ): void {
    navigateWithNativeEvent(
      appName,
      methodName,
      setMicroPathToURL(
        appName,
        targetLocation,
      ),
      false,
      setMicroState(
        appName,
        state ?? null,
      ),
    )
    // clear element scope after navigate
    removeDomScope()
  }

  /**
   * navigation handler
   * @param appName app.name
   * @param app app instance
   * @param to router target options
   * @param replace use router.replace?
   */
  function handleNavigate (
    appName: string,
    app: AppInterface,
    to: RouterTarget,
    replace: boolean,
  ): void {
    const microLocation = app.sandBox!.proxyWindow.location as MicroLocation
    const targetLocation = createURL(to.path, microLocation.href)
    // Only get path data, even if the origin is different from microApp
    const currentFullPath = microLocation.pathname + microLocation.search + microLocation.hash
    const targetFullPath = targetLocation.pathname + targetLocation.search + targetLocation.hash
    if (currentFullPath !== targetFullPath || getMicroPathFromURL(appName) !== targetFullPath) {
      if (!isRouterModePure(appName)) {
        const methodName = (replace && to.replace !== false) || to.replace === true ? 'replaceState' : 'pushState'
        navigateWithRawHistory(appName, methodName, targetLocation, to.state)
      }
      /**
       * TODO:
       *  1. 关闭虚拟路由的跳转地址不同：baseRoute + 子应用地址，文档中要说明
       *  2. 关闭虚拟路由时跳转方式不同：1、基座跳转但不发送popstate事件 2、控制子应用更新location，内部发送popstate事件。
       *  核心思路：减小对基座的影响(子应用跳转不向基座发送popstate事件，其他操作一致)，但这是必要的吗，只是多了一个触发popstate的操作
       *  路由优化方案有两种：
       *    1、减少对基座的影响，主要是解决vue循环刷新的问题
       *    2、全局发送popstate事件，解决主、子都是vue3的冲突问题
       *  两者选一个吧，如果选2，则下面这两行代码可以去掉
       *  NOTE1: history和search模式采用2，这样可以解决vue3的问题，custom采用1，避免vue循环刷新的问题，这样在用户出现问题时各有解决方案。但反过来说，每种方案又分别导致另外的问题，不统一，导致复杂度增高
       *  NOTE2: 关闭虚拟路由，同时发送popstate事件还是无法解决vue3的问题(毕竟history.state理论上还是会冲突)，那么就没必要发送popstate事件了。
       */
      if (isRouterModeCustom(appName) || isRouterModePure(appName)) {
        updateMicroLocationWithEvent(appName, targetFullPath)
      }
    }
  }

  /**
   * create method of router.push/replace
   * NOTE:
   * 1. The same fullPath will be blocked
   * 2. name & path is required
   * 3. path is fullPath except for the domain (the domain can be taken, but not valid)
   * @param replace use router.replace?
   */
  function createNavigationMethod (replace: boolean): navigationMethod {
    return function (to: RouterTarget): Promise<void> {
      return new Promise((resolve, reject) => {
        const appName = formatAppName(to.name)
        if (appName && isString(to.path)) {
          /**
           * active apps, exclude prerender app or hidden keep-alive app
           * NOTE:
           *  1. prerender app or hidden keep-alive app clear and record popstate event, so we cannot control app jump through the API
           *  2. disable memory-router
           */
          /**
           * TODO: 子应用开始渲染但是还没渲染完成
           *  1、调用跳转改如何处理
           *  2、iframe的沙箱还没初始化时执行跳转报错，如何处理。。。
           *  3、hidden app 是否支持跳转
           */
          if (getActiveApps({ excludeHiddenApp: true, excludePreRender: true }).includes(appName)) {
            const app = appInstanceMap.get(appName)!
            resolve(app.sandBox.sandboxReady.then(() => handleNavigate(appName, app, to, replace)))
          } else {
            reject(logError('navigation failed, app does not exist or is inactive'))
          }

          // /**
          //  * app not exit or unmounted, update browser URL with replaceState
          //  * use base app location.origin as baseURL
          //  * 应用不存在或已卸载，依然使用replaceState来更新浏览器地址 -- 不合理
          //  */
          // /**
          //  * TODO: 应用还没渲染或已经卸载最好不要支持跳转了，我知道这是因为解决一些特殊场景，但这么做是非常反直觉的
          //  * 并且在新版本中有多种路由模式，如果应用不存在，我们根本无法知道是哪种模式，那么这里的操作就无意义了。
          //  */
          // const rawLocation = globalEnv.rawWindow.location
          // const targetLocation = createURL(to.path, rawLocation.origin)
          // const targetFullPath = targetLocation.pathname + targetLocation.search + targetLocation.hash
          // if (getMicroPathFromURL(appName) !== targetFullPath) {
          //   navigateWithRawHistory(
          //     appName,
          //     to.replace === false ? 'pushState' : 'replaceState',
          //     targetLocation,
          //     to.state,
          //   )
          // }
        } else {
          reject(logError(`navigation failed, name & path are required when use router.${replace ? 'replace' : 'push'}`))
        }
      })
    }
  }

  // create method of router.go/back/forward
  function createRawHistoryMethod (methodName: string): Func {
    return function (...rests: unknown[]): void {
      return globalEnv.rawWindow.history[methodName](...rests)
    }
  }

  const beforeGuards = useSetRecord<RouterGuard>()
  const afterGuards = useSetRecord<RouterGuard>()

  /**
   * run all of beforeEach/afterEach guards
   * NOTE:
   * 1. Modify browser url first, and then run guards,
   *    consistent with the browser forward & back button
   * 2. Prevent the element binding
   * @param appName app name
   * @param to target location
   * @param from old location
   * @param guards guards list
   */
  function runGuards (
    appName: string,
    to: GuardLocation,
    from: GuardLocation,
    guards: Set<RouterGuard>,
  ) {
    // clear element scope before execute function of parent
    removeDomScope()
    for (const guard of guards) {
      if (isFunction(guard)) {
        guard(to, from, appName)
      } else if (isPlainObject(guard) && isFunction((guard as AccurateGuard)[appName])) {
        guard[appName](to, from)
      }
    }
  }

  /**
   * global hook for router
   * update router information base on microLocation
   * @param appName app name
   * @param microLocation location of microApp
   */
  function executeNavigationGuard (
    appName: string,
    to: GuardLocation,
    from: GuardLocation,
  ): void {
    router.current.set(appName, to)

    runGuards(appName, to, from, beforeGuards.list())

    requestIdleCallback(() => {
      runGuards(appName, to, from, afterGuards.list())
    })
  }

  function clearRouterWhenUnmount (appName: string): void {
    router.current.delete(appName)
  }

  /**
   * NOTE:
   * 1. app not exits
   * 2. sandbox is disabled
   * 3. router mode is custom
   */
  function commonHandlerForAttachToURL (appName: string): void {
    if (isRouterModeSearch(appName)) {
      const app = appInstanceMap.get(appName)!
      attachRouteToBrowserURL(
        appName,
        setMicroPathToURL(appName, app.sandBox.proxyWindow.location as MicroLocation),
        setMicroState(appName, getMicroState(appName)),
      )
    }
  }

  /**
   * Attach specified active app router info to browser url
   * @param appName app name
   */
  function attachToURL (appName: string): void {
    appName = formatAppName(appName)
    if (appName && getActiveApps().includes(appName)) {
      commonHandlerForAttachToURL(appName)
    }
  }

  /**
   * Attach all active app router info to browser url
   * @param includeHiddenApp include hidden keep-alive app
   * @param includePreRender include preRender app
   */
  function attachAllToURL ({
    includeHiddenApp = false,
    includePreRender = false,
  }: AttachAllToURLParam): void {
    getActiveApps({
      excludeHiddenApp: !includeHiddenApp,
      excludePreRender: !includePreRender,
    }).forEach(appName => commonHandlerForAttachToURL(appName))
  }

  function createDefaultPageApi (): CreateDefaultPage {
    // defaultPage data
    const defaultPageRecord = useMapRecord<string>()

    /**
     * defaultPage only effect when mount, and has lower priority than query on browser url
     * SetDefaultPageOptions {
     *   @param name app name
     *   @param path page path
     * }
     */
    function setDefaultPage (options: SetDefaultPageOptions): () => boolean {
      const appName = formatAppName(options.name)
      if (!appName || !options.path) {
        if (__DEV__) {
          if (!appName) {
            logWarn(`setDefaultPage: invalid appName "${appName}"`)
          } else {
            logWarn('setDefaultPage: path is required')
          }
        }
        return noopFalse
      }

      return defaultPageRecord.add(appName, options.path)
    }

    function removeDefaultPage (appName: string): boolean {
      appName = formatAppName(appName)
      if (!appName) return false

      return defaultPageRecord.delete(appName)
    }

    return {
      setDefaultPage,
      removeDefaultPage,
      getDefaultPage: defaultPageRecord.get,
    }
  }

  function createBaseRouterApi (): CreteBaseRouter {
    /**
     * Record base app router, let child app control base app navigation
     */
    let baseRouterProxy: unknown = null
    function setBaseAppRouter (baseRouter: unknown): void {
      if (isObject(baseRouter)) {
        baseRouterProxy = new Proxy(baseRouter, {
          get (target: History, key: PropertyKey): unknown {
            removeDomScope()
            return bindFunctionToRawTarget(Reflect.get(target, key), target, 'BASEROUTER')
          },
          set (target: History, key: PropertyKey, value: unknown): boolean {
            Reflect.set(target, key, value)
            return true
          }
        })
      } else if (__DEV__) {
        logWarn('setBaseAppRouter: Invalid base router')
      }
    }

    return {
      setBaseAppRouter,
      getBaseAppRouter: () => baseRouterProxy,
    }
  }

  // Router API for developer
  const router: Router = {
    current: new Map<string, MicroLocation>(),
    encode: encodeMicroPath,
    decode: decodeMicroPath,
    push: createNavigationMethod(false),
    replace: createNavigationMethod(true),
    go: createRawHistoryMethod('go'),
    back: createRawHistoryMethod('back'),
    forward: createRawHistoryMethod('forward'),
    beforeEach: beforeGuards.add,
    afterEach: afterGuards.add,
    attachToURL,
    attachAllToURL,
    ...createDefaultPageApi(),
    ...createBaseRouterApi(),
  }

  return {
    router,
    executeNavigationGuard,
    clearRouterWhenUnmount,
  }
}

export const {
  router,
  executeNavigationGuard,
  clearRouterWhenUnmount,
} = createRouterApi()
