<template>
  <div class="vue2">
    <el-button type="primary" round @click='changeData'>发送数据</el-button>
    <micro-app
    name='vue2'
      url='http://xxx.jd.com:3000/gpt/'
      :data='data'
      iframe
    >
    <!-- destroy inline scopecss  baseRoute='/vue2' -->
    </micro-app>
  </div>
</template>

<script>

export default {
  name: 'vue2',
  data () {
    return {
      data: {from: '来自基座的初始化数据'}
    }
  },
  methods: {
    changeData () {
      this.data = {from: '来自基座的数据' + (+new Date())}
    },
  }
}
</script>

<style>

</style>
