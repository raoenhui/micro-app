// https://umijs.org/config/
import { defineConfig } from 'umi';
const port = 3000
export default defineConfig({
  headScripts:[
    "https://map.qq.com/api/gljs?v=1.exp&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77",
    "https://api.map.baidu.com/api?type=webgl&v=1.0&ak=GL2PbDxzBxroNb3mmpNicLMMjNCPqG8V",
    "https://webapi.amap.com/maps?v=2.0&key=309f07ac6bc48160e80b480ae511e1e9"
  ],
  plugins: [
    // https://github.com/zthxxx/react-dev-inspector
    'react-dev-inspector/plugins/umi/react-inspector',
  ],
  // https://github.com/zthxxx/react-dev-inspector#inspector-loader-props
  inspectorConfig: {
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
  devServer: {
    port,
  }
})
