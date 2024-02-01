<template>
  <div>
    <div class='logo-img'></div>
    <!-- <div class='outer-img'></div>
    <img src="../assets/logo.png" alt=""> -->
    <h3>Vue@{{version}}</h3>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <div class='msg-title'>{{microDataStr}}</div>
    <span class="iconfont">&#xe649;</span>
    <span class="iconfont zoe-ui-right"></span>
    <svg class="icon" aria-hidden="true">
      <use xlink:href="#zoe-ui-right"></use>
    </svg>
    <div class='test-safari-before' title='sdfsfs'></div>
    <div>
      <button @click="jumpWithLocation">通过location跳转page2</button>
    </div>
    <br />
    <div class="pt60">
      <ul class="wrapper">
        <li v-for="item in liList" :key="item">{{ item }}</li>
      </ul>
      <button @click="renderNode">渲染一万个元素</button>
    </div>
    <router-link to="/page2">page2</router-link>

    <div>{{drag?'拖拽中':'拖拽停止'}}</div>
    <!--使用draggable组件-->
    <draggable v-model="myArray"  chosenClass="chosen" forceFallback="true" group="people" animation="1000" @start="onStart" @end="onEnd">
      <transition-group>
      <div class="item" v-for="element in myArray" :key="element.id">{{element.name}}</div>
      </transition-group>
    </draggable>
    <button @click="testWindowOpen">测试window.open</button>
  </div>
</template>

<script>
import HelloWorld from '../components/HelloWorld.vue'
import Vue from 'vue'
import draggable from 'vuedraggable'

export default {
  name: 'Page1',
  data () {
    return {
      version: Vue.version,
      centerDialogVisible: false,
      microDataStr: '',
      liList: 0,
      drag:false,
      //定义要被拖拽对象的数组
      myArray:[
        {people:'cn',id:1,name:'www.itxst.com'},
        {people:'cn',id:2,name:'www.baidu.com'},
        {people:'cn',id:3,name:'www.taobao.com'},
        {people:'us',id:4,name:'www.google.com'}
      ]
    }
  },
  created () {
    console.timeEnd('vue2')
    window.microApp && window.microApp.addDataListener(this.handleDataChange, true)
  },
  beforeDestroy () {
    window.microApp && window.microApp.removeDataListener(this.handleDataChange)
  },
  components: {
    HelloWorld,
    draggable,
  },
  methods: {
    handleDataChange (data) {
      console.log('vue2 来自基座应用的数据', data)
      this.centerDialogVisible = true
      this.microDataStr = JSON.stringify(data)
    },
    renderNode() {
      console.time("run loop", 10000);

      for (let index = 2; index < 1 * 10000; index++) {
        this.liList = index;
      }

      console.timeLog("run loop", 10000);

      this.$nextTick(() => {
        console.timeEnd("run loop", 10000);
      });
    },
    jumpWithLocation () {
      // 通过location跳转page2
      location.href = '/micro-app/vue2/#/page2'
    },
    //开始拖拽事件
    onStart(){
      this.drag=true;
    },
    //拖拽结束事件
    onEnd() {
      this.drag=false;
    },
    testWindowOpen () {
      window.open('https://www.jd.com/', '_self')
    }
  }
}
</script>

<style>
  .logo-img {
    background: url(../assets/logo.png) no-repeat;
    height: 200px;
    width: 200px;
    margin: 0 auto;
  }
  .msg-title {
    font-weight: 500;
  }
  .outer-img {
    background: url(//vuejs.org/images/logo.png) no-repeat;
    background-size: 100% 100%;
    height: 200px;
    width: 200px;
    margin: 0 auto;
  }

  .test-safari-before::before {
    content: 'ddddd';
    color: red;
  }
  /*被拖拽对象的样式*/
  .item {
    padding: 6px;
    background-color: #fdfdfd;
    border: solid 1px #eee;
    margin-bottom: 10px;
    cursor: move;
  }
  /*选中样式*/
  .chosen {
    border: solid 2px #3089dc !important;
  }
</style>
