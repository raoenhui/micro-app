import type {
  BaseSandboxType,
  AppInterface,
} from '@micro-app/types'
import globalEnv from '../libs/global_env'
import {
  defer,
  isNode,
  rawDefineProperties,
} from '../libs/utils'
import {
  appInstanceMap,
} from '../create_app'

export class BaseSandbox implements BaseSandboxType {
  constructor () {
    this.injectReactHMRProperty()
  }

  // keys that can only assigned to rawWindow
  public rawWindowScopeKeyList: PropertyKey[] = [
    'location',
  ]

  // keys that can escape to rawWindow
  public staticEscapeProperties: PropertyKey[] = [
    'System',
    '__cjsWrapper',
  ]

  // keys that scoped in child app
  public staticScopeProperties: PropertyKey[] = [
    'webpackJsonp',
    'webpackHotUpdate',
    'Vue',
    // TODO: 是否可以和constants/SCOPE_WINDOW_ON_EVENT合并
    'onpopstate',
    'onhashchange',
  ]

  // Properties that can only get and set in microAppWindow, will not escape to rawWindow
  public scopeProperties: PropertyKey[] = Array.from(this.staticScopeProperties)
  // Properties that can be escape to rawWindow
  public escapeProperties: PropertyKey[] = []
  // Properties newly added to microAppWindow
  public injectedKeys = new Set<PropertyKey>()
  // Properties escape to rawWindow, cleared when unmount
  public escapeKeys = new Set<PropertyKey>()
  // Promise used to mark whether the sandbox is initialized
  public sandboxReady!: Promise<void>

  // adapter for react
  private injectReactHMRProperty (): void {
    if (__DEV__) {
      // react child in non-react env
      this.staticEscapeProperties.push('__REACT_ERROR_OVERLAY_GLOBAL_HOOK__')
      // in react parent
      if (globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
        this.staticScopeProperties = this.staticScopeProperties.concat([
          '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
          '__reactRefreshInjected',
        ])
      }
    }
  }
}

/**
 * TODO:
 *  1、将class Adapter去掉，改为CustomWindow，或者让CustomWindow继承Adapter
 *  2、with沙箱中的常量放入CustomWindow，虽然和iframe沙箱不一致，但更合理
 * 修改时机：在iframe沙箱支持插件后再修改
 */
export class CustomWindow {}

// Fix conflict of babel-polyfill@6.x
export function fixBabelPolyfill6 (): void {
  if (globalEnv.rawWindow._babelPolyfill) globalEnv.rawWindow._babelPolyfill = false
}

/**
 * Fix error of hot reload when parent&child created by create-react-app in development environment
 * Issue: https://github.com/micro-zoe/micro-app/issues/382
 */
export function fixReactHMRConflict (app: AppInterface): void {
  if (__DEV__) {
    const rawReactErrorHook = globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__
    const childReactErrorHook = app.sandBox?.proxyWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__
    if (rawReactErrorHook && childReactErrorHook) {
      globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = childReactErrorHook
      defer(() => {
        globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = rawReactErrorHook
      })
    }
  }
}

/**
 * update dom tree of target dom
 * @param container target dom
 * @param appName app name
 */
export function patchElementTree (container: Element | ShadowRoot, appName: string): void {
  const children = Array.from(container.children)

  children.length && children.forEach((child) => {
    patchElementTree(child, appName)
  })

  for (const child of children) {
    updateElementInfo(child, appName)
  }
}

/**
 * rewrite baseURI, ownerDocument, __MICRO_APP_NAME__ of target node
 * @param node target node
 * @param appName app name
 * @returns target node
 */
export function updateElementInfo <T> (node: T, appName: string): T {
  const proxyWindow = appInstanceMap.get(appName)?.sandBox?.proxyWindow
  if (
    isNode(node) &&
    !node.__MICRO_APP_NAME__ &&
    !node.__PURE_ELEMENT__ &&
    proxyWindow
  ) {
    /**
     * TODO:
     *  1. 测试baseURI和ownerDocument在with沙箱中是否正确
     *    经过验证with沙箱不能重写ownerDocument，否则react点击事件会触发两次
     *  2. with沙箱所有node设置__MICRO_APP_NAME__都使用updateElementInfo
    */
    rawDefineProperties(node, {
      baseURI: {
        configurable: true,
        // if disable-memory-router or router-mode='disable', href point to base app
        get: () => proxyWindow.location.href,
      },
      __MICRO_APP_NAME__: {
        configurable: true,
        writable: true,
        value: appName,
      },
    })
  }

  return node
}
