/* eslint-disable no-void */
import type {
  MicroLocation,
  GuardLocation,
  microAppWindowType,
} from '@micro-app/types'
import globalEnv from '../../libs/global_env'
import bindFunctionToRawTarget from '../bind_function'
import {
  assign as oAssign,
  createURL,
  rawDefineProperty,
} from '../../libs/utils'
import {
  setMicroPathToURL,
  isEffectiveApp,
  getMicroState,
  isRouterModeCustom,
  isRouterModeNative,
  isRouterModeSearch,
} from './core'
import {
  dispatchNativeEvent,
} from './event'
import {
  executeNavigationGuard,
} from './api'
import {
  nativeHistoryNavigate,
  navigateWithNativeEvent,
} from './history'
import {
  appInstanceMap,
  isIframeSandbox,
} from '../../create_app'
import {
  hijackMicroLocationKeys,
} from '../iframe/special_key'

// origin is readonly, so we ignore when updateMicroLocation
const locationKeys: ReadonlyArray<keyof MicroLocation> = ['href', 'pathname', 'search', 'hash', 'host', 'hostname', 'port', 'protocol', 'search']
// origin, fullPath is necessary for guardLocation
const guardLocationKeys: ReadonlyArray<keyof MicroLocation> = [...locationKeys, 'origin', 'fullPath']

/**
 * Create location for microApp, each microApp has only one location object, it is a reference type
 * MDN https://developer.mozilla.org/en-US/docs/Web/API/Location
 * @param appName app name
 * @param url app url
 * @param microAppWindow iframeWindow, iframe only
 * @param childStaticLocation real child location info, iframe only
 * @param browserHost host of browser, iframe only
 * @param childHost host of child app, iframe only
 */
export function createMicroLocation (
  appName: string,
  url: string,
  microAppWindow?: microAppWindowType,
  childStaticLocation?: MicroLocation,
  browserHost?: string,
  childHost?: string,
): MicroLocation {
  const rawWindow = globalEnv.rawWindow
  const rawLocation = rawWindow.location
  const isIframe = !!microAppWindow
  /**
   * withLocation is microLocation for with sandbox
   * it is globally unique for child app
   */
  const withLocation = createURL(url)

  /**
   * In iframe, jump through raw iframeLocation will cause microAppWindow.location reset
   * So we get location dynamically
   */
  function getTarget (): MicroLocation {
    return isIframe ? microAppWindow.location : withLocation
  }

  /**
   * Common handler for href, assign, replace
   * It is mainly used to deal with special scenes about hash
   * @param value target path
   * @param methodName pushState/replaceState
   * @returns origin value or formatted value
   */
  function commonHandler (value: string | URL, methodName: string): string | URL | void {
    const targetLocation = createURL(value, proxyLocation.href)
    // Even if the origin is the same, developers still have the possibility of want to jump to a new page
    if (targetLocation.origin === proxyLocation.origin) {
      const setMicroPathResult = setMicroPathToURL(appName, targetLocation)
      // if disable memory-router, navigate directly through rawLocation
      if (isRouterModeSearch(appName)) {
        /**
         * change hash with location.href will not trigger the browser reload
         * so we use pushState & reload to imitate href behavior
         * NOTE:
         *    1. if child app only change hash, it should not trigger browser reload
         *    2. if address is same and has hash, it should not add route stack
         */
        if (
          targetLocation.pathname === proxyLocation.pathname &&
          targetLocation.search === proxyLocation.search
        ) {
          let oldHref = null
          if (targetLocation.hash !== proxyLocation.hash) {
            if (setMicroPathResult.isAttach2Hash) oldHref = rawLocation.href
            nativeHistoryNavigate(appName, methodName, setMicroPathResult.fullPath)
          }

          if (targetLocation.hash) {
            dispatchNativeEvent(appName, false, oldHref)
          } else {
            reload()
          }
          return void 0
        /**
         * when baseApp is hash router, address change of child can not reload browser
         * so we imitate behavior of browser (reload) manually
         */
        } else if (setMicroPathResult.isAttach2Hash) {
          nativeHistoryNavigate(appName, methodName, setMicroPathResult.fullPath)
          reload()
          return void 0
        }
      }

      return setMicroPathResult.fullPath
    }

    return value
  }

  /**
   * common handler for location.pathname & location.search
   * @param targetPath target fullPath
   * @param key pathname/search
   */
  function handleForPathNameAndSearch (targetPath: string, key: keyof Location): void {
    const targetLocation = createURL(targetPath, url)
    // When the browser url has a hash value, the same pathname/search will not refresh browser
    if (targetLocation[key] === proxyLocation[key] && proxyLocation.hash) {
      // The href has not changed, not need to dispatch hashchange event
      dispatchNativeEvent(appName, false)
    } else {
      /**
       * When the value is the same, no new route stack will be added
       * Special scenes such as:
       * pathname: /path ==> /path#hash, /path ==> /path?query
       * search: ?query ==> ?query#hash
       */
      nativeHistoryNavigate(
        appName,
        targetLocation[key] === proxyLocation[key] ? 'replaceState' : 'pushState',
        setMicroPathToURL(appName, targetLocation).fullPath,
      )
      reload()
    }
  }

  const createLocationMethod = (locationMethodName: string) => {
    return function (value: string | URL) {
      if (isEffectiveApp(appName)) {
        const targetPath = commonHandler(value, locationMethodName === 'assign' ? 'pushState' : 'replaceState')
        if (targetPath) {
          // Same as href, complete targetPath with browser origin in vite env
          rawLocation[locationMethodName](createURL(targetPath, rawLocation.origin).href)
        }
      }
    }
  }

  const assign = createLocationMethod('assign')
  const replace = createLocationMethod('replace')
  const reload = (forcedReload?: boolean): void => rawLocation.reload(forcedReload)

  rawDefineProperty(getTarget(), 'fullPath', {
    enumerable: true,
    configurable: true,
    get: () => proxyLocation.pathname + proxyLocation.search + proxyLocation.hash,
  })

  /**
   * location.assign/replace is readonly, cannot be proxy, so we use empty object as proxy target
   */
  const proxyLocation = new Proxy({} as Location, {
    get: (_: Location, key: string): unknown => {
      const target = getTarget()

      if (key === 'assign') return assign
      if (key === 'replace') return replace
      if (key === 'reload') return reload
      if (key === 'self') return target
      if (key === 'fullPath') return target.fullPath

      if (isRouterModeNative(appName)) {
        return bindFunctionToRawTarget<Location>(Reflect.get(rawLocation, key), rawLocation, 'LOCATION')
      }

      // src of iframe is base app address, it needs to be replaced separately
      if (isIframe) {
        // host hostname port protocol
        if (hijackMicroLocationKeys.includes(key)) {
          return childStaticLocation![key]
        }

        if (key === 'href') {
          // do not use target, because target may be deleted
          return target[key].replace(browserHost!, childHost!)
        }
      }

      return bindFunctionToRawTarget<Location>(Reflect.get(target, key), target, 'LOCATION')
    },
    set: (_: Location, key: string, value: string): boolean => {
      if (isEffectiveApp(appName)) {
        const target = getTarget()
        if (key === 'href') {
          /**
           * In vite, targetPath without origin will be completed with child origin
           * So we use browser origin to complete targetPath to avoid this problem
           * NOTE:
           *  1. history mode & value is childOrigin + path ==> jump to browserOrigin + path
           *  2. disable mode & value is childOrigin + path ==> jump to childOrigin + path
           *  3. search mode & value is browserOrigin + path ==> jump to browserOrigin + path
           */
          const targetPath = commonHandler(value, 'pushState')
          if (targetPath) {
            rawLocation.href = createURL(targetPath, rawLocation.origin).href
          }
        } else if (key === 'pathname') {
          if (isRouterModeCustom(appName)) {
            rawLocation.pathname = value
          } else {
            const targetPath = ('/' + value).replace(/^\/+/, '/') + proxyLocation.search + proxyLocation.hash
            handleForPathNameAndSearch(targetPath, 'pathname')
          }
        } else if (key === 'search') {
          if (isRouterModeCustom(appName)) {
            rawLocation.search = value
          } else {
            const targetPath = proxyLocation.pathname + ('?' + value).replace(/^\?+/, '?') + proxyLocation.hash
            handleForPathNameAndSearch(targetPath, 'search')
          }
        } else if (key === 'hash') {
          if (isRouterModeCustom(appName)) {
            rawLocation.hash = value
          } else {
            const targetPath = proxyLocation.pathname + proxyLocation.search + ('#' + value).replace(/^#+/, '#')
            const targetLocation = createURL(targetPath, url)
            // The same hash will not trigger popStateEvent
            if (targetLocation.hash !== proxyLocation.hash) {
              navigateWithNativeEvent(
                appName,
                'pushState',
                setMicroPathToURL(appName, targetLocation),
                false,
              )
            }
          }
        } else {
          Reflect.set(target, key, value)
        }
      }
      return true
    },
  })

  return proxyLocation as MicroLocation
}

/**
 * create guardLocation by microLocation, used for router guard
 */
export function createGuardLocation (appName: string, microLocation: MicroLocation): GuardLocation {
  const guardLocation = oAssign({ name: appName }, microLocation) as GuardLocation
  // The prototype values on the URL needs to be manually transferred
  for (const key of guardLocationKeys) guardLocation[key] = microLocation[key]
  return guardLocation
}

// for updateBrowserURLWithLocation when initial
export function autoTriggerNavigationGuard (appName: string, microLocation: MicroLocation): void {
  executeNavigationGuard(appName, createGuardLocation(appName, microLocation), createGuardLocation(appName, microLocation))
}

/**
 * The following scenes will trigger location update:
 * 1. pushState/replaceState
 * 2. popStateEvent
 * 3. query on browser url when init sub app
 * 4. set defaultPage when when init sub app
 * NOTE:
 * 1. update browser URL first, and then update microLocation
 * 2. the same fullPath will not trigger router guards
 * @param appName app name
 * @param path target path
 * @param base base url
 * @param microLocation micro app location
 * @param type auto prevent
 */
export function updateMicroLocation (
  appName: string,
  path: string,
  microLocation: MicroLocation,
  type?: string,
): void {
  // record old values of microLocation to `from`
  const from = createGuardLocation(appName, microLocation)
  // if is iframeSandbox, microLocation muse be rawLocation of iframe, not proxyLocation
  const newLocation = createURL(path, microLocation.href)
  if (isIframeSandbox(appName)) {
    const microAppWindow = appInstanceMap.get(appName)!.sandBox.microAppWindow
    microAppWindow.rawReplaceState?.call(microAppWindow.history, getMicroState(appName), '', newLocation.href)
  } else {
    let targetHref = newLocation.href
    if (microLocation.self.origin !== newLocation.origin) {
      targetHref = targetHref.replace(newLocation.origin, microLocation.self.origin)
    }
    microLocation.self.href = targetHref
  }
  // update latest values of microLocation to `to`
  const to = createGuardLocation(appName, microLocation)

  // The hook called only when fullPath changed
  if (type === 'auto' || (from.fullPath !== to.fullPath && type !== 'prevent')) {
    executeNavigationGuard(appName, to, from)
  }
}
