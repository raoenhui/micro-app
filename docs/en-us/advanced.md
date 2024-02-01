## 1、Custom fetch
By replacing the built-in fetch of the framework with a custom fetch, you can modify the fetch configuration (add cookies or header information, etc.), or intercept static resources such as HTML, JS, CSS, etc.

The custom fetch must be a promise that returns a string type.
```js
import microApp from '@micro-zoe/micro-app'

microApp.start({
  /**
   * Custom fetch
   * @param {string} url static resource address
   * @param {object} options fetch request configuration items
   * @param {string|null} appName App Name
   * @returns Promise<string>
  */
  fetch (url, options, appName) {
    if (url === 'http://localhost:3001/error.js') {
      // Delete http://localhost:3001/error.js Content of
      return Promise.resolve('')
    }
    
    const config = {
      // fetch does not come with a cookie by default. If you need to add a cookie, you need to configure credentials
      credentials: 'include', // request with cookie
    }

    return window.fetch(url, Object.assign(options, config)).then((res) => {
      return res.text()
    })
  }
})
```

> [!NOTE]
> 1、If a cross domain request comes with a cookie, then `Access Control Allow Origin` cannot be set to `*`, a domain name must be specified, and `Access-Control-Allow-Credentials: true` must be set at the same time