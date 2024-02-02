/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from '@micro-zoe/micro-app/polyfill/jsx-custom-event'
import { useState, useEffect } from 'react'
import { Button, Spin, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
// import { EventCenterForMicroApp } from '@micro-zoe/micro-app'
import config from '../../config'
import './vite2.less'
import microApp from '@micro-zoe/micro-app'

// 注册子应用vite2的数据通信对象
// window.eventCenterForVite = new EventCenterForMicroApp('vite2')

const antIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />

function vite2 (props) {
  const [data, changeData] = useState({from: '来自基座的初始化数据'})
  const [showLoading, hideLoading] = useState(true)

  function handleMounted () {
    console.timeEnd('vite2')
    hideLoading(false)
    console.log('主应用-生命周期：mounted -- vite2')
  }

  function handleDataChange (e) {
    console.log('来自 vite2 子应用的数据', e.detail.data)
  }

  function jumpToHome () {
    microApp.router.push({name: 'vite2', path: '/micro-app/vite2/'})
  }

  function jumpToElementPlus () {
    microApp.router.push({name: 'vite2', path: '/micro-app/vite2/element-plus'})
  }

  function jumpToAntDesignVue () {
    microApp.router.push({name: 'vite2', path: '/micro-app/vite2/ant-design-vue'})
  }

  useEffect(() => {
    console.time('vite2')
    // const releaseBeforeEach1 = microApp.router.beforeEach((to, from, appName) => {
    //   console.log('全局 beforeEach: ', to, from, appName)
    // })

    // const releaseBeforeEach2 = microApp.router.beforeEach({
    //   vite2 (to, from) {
    //     console.log('指定 beforeEach: ', to, from)
    //   }
    // })

    // const releaseAfterEach1 = microApp.router.afterEach((to, from, appName) => {
    //   console.log('全局 afterEach: ', to, from, appName)
    // })

    // const releaseAfterEach2 = microApp.router.afterEach({
    //   vite2 (to, from) {
    //     console.log('指定 afterEach: ', to, from)
    //   }
    // })

    microApp.router.setBaseAppRouter(props.history)

    return () => {
      // releaseBeforeEach1()
      // releaseBeforeEach2()
      // releaseAfterEach1()
      // releaseAfterEach2()
    }
  }, [])

  return (
    <div>
      <div className='btn-con'>
        <Col span={6} className='btn-con'>
          <Button type='primary' onClick={() => changeData({from: '来自基座的数据' + (+new Date())})}>
            向子应用发送数据
          </Button>
          <Button type="primary" onClick={jumpToHome}>控制子应用跳转首页</Button>
          <Button type="primary" onClick={jumpToElementPlus}>控制子应用跳转element-plus</Button>
          <Button type="primary" onClick={jumpToAntDesignVue}>控制子应用跳转ant-design-vue</Button>
        </Col>
      </div>
      {
        showLoading && <Spin indicator={antIcon} />
      }
      <micro-app
        name='vite2'
        url={`${config.vite2}micro-app/vite2/`}
        // url={`http://127.0.0.1:8080/micro-app/vite2/`}
        data={data}
        // onCreated={() => Promise.resolve().then(() => jumpToElementPlus())}
        // onBeforemount={() => jumpToElementPlus()}
        onMounted={handleMounted}
        onDataChange={handleDataChange}
        onAfterhidden={() => console.log('基座：keep-alive：Afterhidden 已推入后台')}
        onBeforeshow={() => console.log('基座：keep-alive：Beforeshow 即将推入前台')}
        onAftershow={() => {console.log('基座：keep-alive：Aftershow 已经推入前台'); hideLoading(false)}}
        onError={() => console.log('渲染出错')}
        // destroy
        // inline
        // disableSandbox
        iframe
        // keep-router-state
        // disable-patch-request
        // keep-alive
        // default-page='/micro-app/vite2/element-plus'
        // disable-memory-router
        // router-mode='native'
        baseroute='/micro-app/demo/vite2'
      >
      </micro-app>

      {/* <iframe src={`${config.vite2}micro-app/vite2/`} width='100%' height='600px'></iframe> */}
    </div>
  )
}

export default vite2
