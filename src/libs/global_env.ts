import type {
  AppInterface,
  RequestIdleCallbackInfo,
  RequestIdleCallbackOptions,
} from '@micro-app/types'
import {
  isSupportModuleScript,
  isBrowser,
  getCurrentAppName,
  assign,
} from './utils'
import {
  rejectMicroAppStyle,
} from '../source/patch'

declare global {
  interface Node {
    __MICRO_APP_NAME__?: string | null
    __PURE_ELEMENT__?: boolean
    __MICRO_APP_HAS_DPN__?: boolean
    data?: unknown
    rawParentNode?: ParentNode | null
  }

  interface HTMLStyleElement {
    __MICRO_APP_HAS_SCOPED__?: boolean
  }

  interface HTMLElement {
    reload(destroy?: boolean): Promise<boolean>
    mount(app: AppInterface): void
    unmount (destroy?: boolean, unmountcb?: CallableFunction): void
  }

  interface Window {
    requestIdleCallback (
      callback: (info: RequestIdleCallbackInfo) => void,
      opts?: RequestIdleCallbackOptions,
    ): number
    _babelPolyfill: boolean
    __MICRO_APP_ENVIRONMENT__?: boolean
    __MICRO_APP_UMD_MODE__?: boolean
    __MICRO_APP_BASE_APPLICATION__?: boolean
    __REACT_ERROR_OVERLAY_GLOBAL_HOOK__: boolean
    rawLocation: Location
    rawWindow: Window
    rawDocument: Document
    Document: any
    Element: any,
    Node: any,
    EventTarget: any,
    HTMLElement: HTMLElement,
  }
}

const globalEnv: Record<string, any> = {
  // active sandbox count
  activeSandbox: 0,
}

/**
 * Note loop nesting
 * Only prototype or unique values can be put here
 */
export function initGlobalEnv (): void {
  if (isBrowser) {
    const rawWindow = window.rawWindow || Function('return window')()
    const rawDocument = window.rawDocument || Function('return document')()
    const rawRootDocument = rawWindow.Document || Function('return Document')()
    const rawRootElement = rawWindow.Element
    const rawRootNode = rawWindow.Node
    const rawRootEventTarget = rawWindow.EventTarget

    // save patch raw methods, pay attention to this binding
    const rawSetAttribute = rawRootElement.prototype.setAttribute
    const rawAppendChild = rawRootElement.prototype.appendChild
    const rawInsertBefore = rawRootElement.prototype.insertBefore
    const rawReplaceChild = rawRootElement.prototype.replaceChild
    const rawRemoveChild = rawRootElement.prototype.removeChild
    const rawAppend = rawRootElement.prototype.append
    const rawPrepend = rawRootElement.prototype.prepend
    const rawCloneNode = rawRootElement.prototype.cloneNode
    const rawElementQuerySelector = rawRootElement.prototype.querySelector
    const rawElementQuerySelectorAll = rawRootElement.prototype.querySelectorAll
    const rawInsertAdjacentElement = rawRootElement.prototype.insertAdjacentElement
    const rawInnerHTMLDesc = Object.getOwnPropertyDescriptor(rawRootElement.prototype, 'innerHTML')
    const rawParentNodeDesc = Object.getOwnPropertyDescriptor(rawRootNode.prototype, 'parentNode')

    // Document proto methods
    const rawCreateElement = rawRootDocument.prototype.createElement
    const rawCreateElementNS = rawRootDocument.prototype.createElementNS
    const rawCreateTextNode = rawRootDocument.prototype.createTextNode
    const rawCreateDocumentFragment = rawRootDocument.prototype.createDocumentFragment
    const rawCreateComment = rawRootDocument.prototype.createComment
    const rawQuerySelector = rawRootDocument.prototype.querySelector
    const rawQuerySelectorAll = rawRootDocument.prototype.querySelectorAll
    const rawGetElementById = rawRootDocument.prototype.getElementById
    const rawGetElementsByClassName = rawRootDocument.prototype.getElementsByClassName
    const rawGetElementsByTagName = rawRootDocument.prototype.getElementsByTagName
    const rawGetElementsByName = rawRootDocument.prototype.getElementsByName

    const ImageProxy = new Proxy(Image, {
      construct (Target, args): HTMLImageElement {
        const elementImage = new Target(...args)
        const currentAppName = getCurrentAppName()
        if (currentAppName) elementImage.__MICRO_APP_NAME__ = currentAppName
        return elementImage
      },
    })

    /**
     * save effect raw methods
     * pay attention to this binding, especially setInterval, setTimeout, clearInterval, clearTimeout
     */
    const rawSetInterval = rawWindow.setInterval
    const rawSetTimeout = rawWindow.setTimeout
    const rawClearInterval = rawWindow.clearInterval
    const rawClearTimeout = rawWindow.clearTimeout
    const rawPushState = rawWindow.history.pushState
    const rawReplaceState = rawWindow.history.replaceState
    const rawAddEventListener = rawRootEventTarget.prototype.addEventListener
    const rawRemoveEventListener = rawRootEventTarget.prototype.removeEventListener
    const rawDispatchEvent = rawRootEventTarget.prototype.dispatchEvent

    // mark current application as base application
    window.__MICRO_APP_BASE_APPLICATION__ = true

    assign(globalEnv, {
      supportModuleScript: isSupportModuleScript(),

      // common global vars
      rawWindow,
      rawDocument,
      rawRootDocument,
      rawRootElement,
      rawRootNode,

      // source/patch
      rawSetAttribute,
      rawAppendChild,
      rawInsertBefore,
      rawReplaceChild,
      rawRemoveChild,
      rawAppend,
      rawPrepend,
      rawCloneNode,
      rawElementQuerySelector,
      rawElementQuerySelectorAll,
      rawInsertAdjacentElement,
      rawInnerHTMLDesc,
      rawParentNodeDesc,

      rawCreateElement,
      rawCreateElementNS,
      rawCreateDocumentFragment,
      rawCreateTextNode,
      rawCreateComment,
      rawQuerySelector,
      rawQuerySelectorAll,
      rawGetElementById,
      rawGetElementsByClassName,
      rawGetElementsByTagName,
      rawGetElementsByName,
      ImageProxy,

      // sandbox/effect
      rawSetInterval,
      rawSetTimeout,
      rawClearInterval,
      rawClearTimeout,
      rawPushState,
      rawReplaceState,
      rawAddEventListener,
      rawRemoveEventListener,
      rawDispatchEvent,

      // iframe
    })

    // global effect
    rejectMicroAppStyle()
  }
}

export default globalEnv
