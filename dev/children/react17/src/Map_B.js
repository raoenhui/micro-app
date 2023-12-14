
import React from 'react';

export default function MapB(){
 const initMap = () => {
  // BMapGL().then(() => {
    var map = new window.BMapGL.Map('container_b'); // 创建Map实例
    map.centerAndZoom(new window.BMapGL.Point(116.404, 39.915), 12); // 初始化地图,设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
  // });
};

React.useEffect(() => {
  if(window.BMapGL){
    initMap();
  }
}, []);

  return <div id="container_b" style={{height:300, width:800}}></div>
}





