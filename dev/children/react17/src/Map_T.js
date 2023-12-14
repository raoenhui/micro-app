
import React from 'react';

export default function MapT(){
 const mapRef = React.useRef();

 const initMap = () => {
  // TMapGL().then(() => {
    const centerLngLat = new window.TMap.LatLng(39.984104, 116.307503);
    const map = new window.TMap.Map('container_t', {
      draggable: false,  // 不允许拖拽地图
      center: centerLngLat, // 设置中心点经纬度
      zoom: 14,  // 设置默认地图比例
      mapZoomType: window.TMap.constants.MAP_ZOOM_TYPE.CENTER  // 地图缩放焦点控制
    });
    // map.removeControl(window.TMap.constants.DEFAULT_CONTROL_ID.SCALE); // 隐藏比例尺控件
    // map.removeControl(window.TMap.constants.DEFAULT_CONTROL_ID.ROTATION); // 隐藏旋转控件
    // mapRef.current = map;
  // });
};

React.useEffect(() => {
  if(window.TMap){
    initMap();
  }
}, []);

  return <div id="container_t" style={{height:300, width:800}}></div>
}





