<template>
  <div>
    <img src="../assets/logo.png" alt="">
    <HelloWorld msg="Welcome to Vue@3"/>
    <el-row justify="center">
      <router-link to="/element-plus">
        <el-button type="primary" plain>跳转element-plus</el-button>
      </router-link>&emsp;
      <router-link to="/ant-design-vue">
        <el-button type="primary" plain>跳转ant-design-vue</el-button>
      </router-link>
    </el-row>
    <br>
    <el-dialog v-model="centerDialogVisible" title="Warning" width="30%" center>
      <span>{{microDataStr}}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="centerDialogVisible = false"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import HelloWorld from '../components/HelloWorld.vue'

export default {
  name: 'Page1',
  data () {
    return {
      centerDialogVisible: false,
      microDataStr: '',
    }
  },
  created () {
    window.microApp && window.microApp.addDataListener(this.handleDataChange)
  },
  beforeUnmount () {
    window.microApp && window.microApp.removeDataListener(this.handleDataChange)
  },
  components: {
    HelloWorld
  },
  methods: {
    handleDataChange (data) {
      console.log('vue3 来自基座应用的数据', data)
      this.centerDialogVisible = true
      this.microDataStr = JSON.stringify(data)
    }
  }
}
</script>

<style>

</style>
