/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from '@micro-zoe/micro-app/polyfill/jsx-custom-event'
import { useState } from 'react'
import { Spin, Button, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import config from '../../config'
import microApp from '@micro-zoe/micro-app'

const antIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />

function Vue3 () {
  const [showLoading, hideLoading] = useState(true)
  const [data, changeData] = useState({from: '来自基座的初始化数据'})

  function jumpToHome () {
    microApp.router.push({name: 'vue3', path: '/micro-app/vue3/'})
  }

  function jumpToElementPlus () {
    microApp.router.push({name: 'vue3', path: '/micro-app/vue3/element-plus'})
  }
  function jumpToAntDesignVue () {
    microApp.router.push({name: 'vue3', path: '/micro-app/vue3/ant-design-vue'})
  }

  return (
    <div>
      <Col span={7} className='btn-con'>
        <Button type="primary" onClick={changeData.bind(this, {type: '新数据' + new Date()})}>
          向子应用发送数据
        </Button>
        <Button type="primary" onClick={jumpToHome}>控制子应用跳转home</Button>
        <Button type="primary" onClick={jumpToElementPlus}>控制子应用跳转element-plus</Button>
        <Button type="primary" onClick={jumpToAntDesignVue}>控制子应用跳转ant-design-vue</Button>
      </Col>
      {
        showLoading && <Spin indicator={antIcon} />
      }
      <micro-app
        name='vue3'
        url={`${config.vue3}micro-app/vue3`}
        data={data}
        onMounted={() => hideLoading(false)}
        onBeforeshow={() => hideLoading(false)}
        baseRoute='/micro-app/demo/vue3'
        // disableScopecss
        // keep-alive
        keep-router-state
        // inline
        // destroy
        // disableSandbox
        // shadowDOM
        // iframe
      >
      </micro-app>
    </div>
  )
}

export default Vue3
