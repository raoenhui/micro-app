
import React from 'react';

export default function Map_G(){
//  const mapRef = React.useRef();

 const initMap = () => {
  // BMapGL().then(() => {
    var map = new window.AMap.Map('container_g', {
      viewMode: '2D', // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D'
      zoom:11, // 初始化地图层级
      center: [116.397428, 39.90923] // 初始化地图中心点
  });
  // });

  console.log(map)
};

React.useEffect(() => {
  window._AMapSecurityConfig = {
    // securityJsCode:'1d1c21a4261e6ff2034e942d7dad235a',
    securityJsCode:'eee97b5d6e106d445578515aa7708c6f',
  }

  if(window.AMap){
    initMap();
  }
}, []);

  return <div id="container_g" style={{height:300, width:800}}></div>
}





