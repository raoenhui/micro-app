import type { AppInterface, fiberTasks } from '@micro-app/types'
import {
  logError,
  CompletionPath,
  injectFiberTask,
  serialExecFiberTasks,
  isLinkElement,
  isScriptElement,
  isStyleElement,
  isImageElement,
} from '../libs/utils'
import {
  extractLinkFromHtml,
  fetchLinksFromHtml,
} from './links'
import {
  extractScriptElement,
  fetchScriptsFromHtml,
  checkExcludeUrl,
  checkIgnoreUrl,
} from './scripts'
import scopedCSS from '../sandbox/scoped_css'
import globalEnv from '../libs/global_env'

/**
 * Recursively process each child element
 * @param parent parent element
 * @param app app
 * @param microAppHead micro-app-head element
 */
function flatChildren (
  parent: HTMLElement,
  app: AppInterface,
  microAppHead: Element,
  fiberStyleTasks: fiberTasks,
): void {
  const children = Array.from(parent.children)

  children.length && children.forEach((child) => {
    flatChildren(child as HTMLElement, app, microAppHead, fiberStyleTasks)
  })

  for (const dom of children) {
    if (isLinkElement(dom)) {
      if (dom.hasAttribute('exclude') || checkExcludeUrl(dom.getAttribute('href'), app.name)) {
        parent.replaceChild(document.createComment('link element with exclude attribute ignored by micro-app'), dom)
      } else if (!(dom.hasAttribute('ignore') || checkIgnoreUrl(dom.getAttribute('href'), app.name))) {
        extractLinkFromHtml(dom, parent, app)
      } else if (dom.hasAttribute('href')) {
        globalEnv.rawSetAttribute.call(dom, 'href', CompletionPath(dom.getAttribute('href')!, app.url))
      }
    } else if (isStyleElement(dom)) {
      if (dom.hasAttribute('exclude')) {
        parent.replaceChild(document.createComment('style element with exclude attribute ignored by micro-app'), dom)
      } else if (app.scopecss && !dom.hasAttribute('ignore')) {
        injectFiberTask(fiberStyleTasks, () => scopedCSS(dom, app))
      }
    } else if (isScriptElement(dom)) {
      extractScriptElement(dom, parent, app)
    } else if (isImageElement(dom) && dom.hasAttribute('src')) {
      globalEnv.rawSetAttribute.call(dom, 'src', CompletionPath(dom.getAttribute('src')!, app.url))
    }
    /**
     * Don't remove meta and title, they have some special scenes
     * e.g.
     * document.querySelector('meta[name="viewport"]') // for flexible
     * document.querySelector('meta[name="baseurl"]').baseurl // for api request
     *
     * Title point to main app title, child app title used to be compatible with some special scenes
     */
    // else if (dom instanceof HTMLMetaElement || dom instanceof HTMLTitleElement) {
    //   parent.removeChild(dom)
    // }
  }
}

/**
 * Extract link and script, bind style scope
 * @param htmlStr html string
 * @param app app
 */
export function extractSourceDom (htmlStr: string, app: AppInterface): void {
  const wrapElement = app.parseHtmlString(htmlStr)
  const microAppHead = globalEnv.rawElementQuerySelector.call(wrapElement, 'micro-app-head')
  const microAppBody = globalEnv.rawElementQuerySelector.call(wrapElement, 'micro-app-body')

  if (!microAppHead || !microAppBody) {
    const msg = `element ${microAppHead ? 'body' : 'head'} is missing`
    app.onerror(new Error(msg))
    return logError(msg, app.name)
  }

  const fiberStyleTasks: fiberTasks = app.isPrefetch || app.fiber ? [] : null

  flatChildren(wrapElement, app, microAppHead, fiberStyleTasks)

  /**
   * Style and link are parallel, because it takes a lot of time for link to request resources. During this period, style processing can be performed to improve efficiency.
   */
  const fiberStyleResult = serialExecFiberTasks(fiberStyleTasks)

  if (app.source.links.size) {
    fetchLinksFromHtml(wrapElement, app, microAppHead, fiberStyleResult)
  } else if (fiberStyleResult) {
    fiberStyleResult.then(() => app.onLoad({ html: wrapElement }))
  } else {
    app.onLoad({ html: wrapElement })
  }

  if (app.source.scripts.size) {
    fetchScriptsFromHtml(wrapElement, app)
  } else {
    app.onLoad({ html: wrapElement })
  }
}
