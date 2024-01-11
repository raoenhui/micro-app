### Micro frontend
The concept of micro frontend was proposed by ThoughtWorks in 2016. It draws on the Architectural concept of micro-services. The core is to split a huge front-end application into multiple independent and flexible small applications. Each application can be independently developed and independently developed. Run, deploy independently, and then merge these small applications into a complete application, or merge several unrelated applications that have been running for a long time into one application. micro frontend can not only integrate multiple projects into one, but also reduce the Coupling between projects and improve project scalability. Compared with a complete front-end warehouse, the front-end warehouse Under the micro frontend architecture tends to be smaller and more flexible.

It mainly solves two problems:

- 1. As the project iteration application becomes larger and larger, it becomes difficult to maintain.
- 2. Inefficiency caused by cross-team or cross-department collaborative development projects.

![microfroentend](https://img12.360buyimg.com/imagetools/jfs/t1/16487/16/31677/95933/6523ce90F10951212/78b3cee6ce36845b.png ':size=800')

### About micro-app
   Before `micro-app`, there were already some open source micro frontend frameworks in the industry, two of the more popular ones: `single-spa` and `qiankun`.
  
   `single-spa` listens to the url change event, matches the rendered sub-application and renders it when the route changes. This idea is also the current mainstream way to implement micro frontend. At the same time, `single-spa` requires the sub-application to modify the rendering logic and exposes three methods: `bootstrap`, `mount`, and `unmount`, which correspond to initialization, rendering, and uninstallation respectively. This also results in the sub-application needing to modify the entry file. . Because `qiankun` is packaged based on `single-spa`, these features are also inherited by `qiankun`, and some modifications to the webpack configuration are required.
  
   `micro-app` does not follow the idea of `single-spa`, but draws on the idea of ​​WebComponent. It uses CustomElement combined with the custom ShadowDom to encapsulate the micro frontend into a WebComponent-like component, thereby realizing componentized rendering of the micro frontend. . And due to the isolation characteristics of custom ShadowDom, `micro-app` does not need to require sub-applications to modify rendering logic and expose methods like `single-spa` and `qiankun`, nor does it need to modify webpack configuration. It is currently the only solution on the market. The lowest cost solution for micro frontend.

   ##### Concept map
   ![image](https://img10.360buyimg.com/imagetools/jfs/t1/168885/23/20790/54203/6084d445E0c9ec00e/d879637b4bb34253.png ':size=750')


### Advantages of micro-app
   #### 1. Easy to use
   We encapsulate all functions into a class WebComponent component, so that a single line of code can be embedded in the base application to render a micro frontend application.

   #### 2. Powerful function
   `micro-app` provides a series of complete functions such as `js sandbox`, `style isolation`, `element isolation`, `routing isolation`, `preloading`, `data communication`, etc.

   #### 3. Compatible with all frameworks
   In order to ensure the independent development and independent deployment capabilities of each business, `micro-app` has made a lot of compatibility and can run normally in any front-end framework.