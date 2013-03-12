Ext.define('GPSTest.controller.MapController',{
	extend: 'Ext.app.Controller',
	
	views:['MapView'],
	
	config: {
		refs: {
			uploadBtn: 'button[id = uploadBtn]',
			mapContainer: 'panel[id = mapContainer]'
		},
		
		control:{
			mapContainer: {
				'initialize': 'addPaintedEvent'
			},
			uploadBtn: {
				'tap': 'uploadPosInfo'
			}
		}
	},
	
	uploadPosInfo: function(){
		if(MapObject.currentGPSX == null || MapObject.currentGPSY == null){
			Ext.Msg.alert('<p>提示</p>','请先进行定位');
		}
		else
		{
			Ext.Ajax.request({
				url: "http://61.152.145.63:8080/GPSTest/GPSUpload",
				disableCaching: true,
				params: {
					'lng': MapObject.currentGPSX,
					'lat': MapObject.currentGPSY,
					'date': Ext.Date.format(new Date(), 'Y-m-d H:i:s')
				},
				success: function(response){
					Ext.Msg.alert('<p>提示</p>', response.responseText);
				},
				failure: function(response){
					if(response.status == 500){
						Ext.Msg.alert('<p>提示</p>', '服务器端程序错误, 请稍候再试');
					}
					else{
						Ext.Msg.alert('<p>提示</p>', '连接超时, 请稍候再试');
					}
				}
			})
		}
	},
	
	addPaintedEvent: function(_thisContainer){
		_thisContainer.addListener('painted',function(){this.initMapView()}, this);
	},
	
	initMapView: function(){
		if(MapObject.bmap == null){
			MapObject.bmap = new BMap.Map("mapDiv");
			MapObject.bmap.enableInertialDragging()
			MapObject.bmap.centerAndZoom("上海", 12); // 初始化地图,设置中心点坐标和地图级别。
			
			Ext.create('Ext.Button', {
						iconCls : 'zoom_in',
						iconMask : true,
						renderTo : 'zoominBtnDiv',
						width : 45,
						height : 45,
						scope: MapObject,
						handler: function() {
							this.bmap.zoomIn();
						}
					});
			Ext.create('Ext.Button', {
						iconCls : 'zoom_out',
						iconMask : true,
						renderTo : 'zoomoutBtnDiv',
						width : 45,
						height : 45,
						margin: '5 0 0 0',
						scope: MapObject,
						handler: function() {
							this.bmap.zoomOut();
						}
					});
			Ext.create('Ext.Button', {
						id: 'locateBtn',
						iconCls : 'locate',
						iconMask : true,
						renderTo : 'locateBtnDiv',
						width : 45,
						height : 45,
						scope: MapObject,
						handler: function(){
							this.locate(false);
						}
					});
		}
//		this.locate();
	}
})

var MapObject = {
	bmap: null,
	currentGPSX: null,
	currentGPSY: null,
	currentBMapX: null,
	currentBMapY: null,
	accuracy: null,
	currentLocOverlay: null,
	currentLocAccuracyOverlay: null,
	customOverlay: [],
	customOverlayType: null,
	deviceOverlay: [],
	deviceBMapX: null,
	deviceBMapY: null,
	routeOverlay: [],
	routeResult: [],
	
	//isQuiet为True时将只记录点位，而不在地图上显示
	isQuiet: false,
	isLocateSuccess: false,
	isError: false,
	
	setStatus: function(_txt){
		var statusBar = Ext.fly('mapStatusBar');
		statusBar.setHtml(_txt);
	},
	
	clearRouteOverlay: function(){
		for(var i=0; i<MapObject.routeOverlay.length; i++){
			MapObject.bmap.removeOverlay(MapObject.routeOverlay[i]);
		}
		MapObject.routeOverlay = [];
	},
	
	clearDeviceOverlay: function(){
		for(var i=0; i<MapObject.deviceOverlay.length; i++){
			MapObject.bmap.removeOverlay(MapObject.deviceOverlay[i]);
		}
		MapObject.deviceOverlay = [];
	},
	
	clearCustomOverlay: function(){
		for(var i=0; i<MapObject.customOverlay.length; i++){
			MapObject.bmap.removeOverlay(MapObject.customOverlay[i]);
		}
		MapObject.customOverlay = [];
	},
	
	clearLocOverlay: function(){
		MapObject.setStatus('');
		MapObject.currentBMapX = null;
		MapObject.currentBMapY = null;
		if(MapObject.currentLocOverlay != null){
			MapObject.bmap.removeOverlay(MapObject.currentLocOverlay);
			MapObject.bmap.removeOverlay(MapObject.currentLocAccuracyOverlay);
		}
	},
	
	//=======HTML5定位模块=======
	locate: function(_isQuiet){
		MapObject.isError = false;
		MapObject.isLocateSuccess = false;
		MapObject.isQuiet = _isQuiet;
		MapObject.clearLocOverlay();
//		if(MapObject.currentLocOverlay != null){
//			MapObject.bmap.removeOverlay(MapObject.currentLocOverlay);
//			MapObject.bmap.removeOverlay(MapObject.currentLocAccuracyOverlay);
//		}
		MapObject.setStatus('正在定位...');
		var options = {
			enableHighAccuracy : true,
			maximumAge: 0,
			timeout:30000
		};
		navigator.geolocation.getCurrentPosition(MapObject.locateSuccess, MapObject.locateError, options);
	},
	
	locateSuccess: function(_position){
		MapObject.currentGPSX = Ext.Number.toFixed(_position.coords.longitude, 4);
		MapObject.currentGPSY = Ext.Number.toFixed(_position.coords.latitude, 4);
		var gpsPoint = new BMap.Point(_position.coords.longitude, _position.coords.latitude);
		MapObject.accuracy = _position.coords.accuracy;
		BMap.Convertor.translate(gpsPoint, 0, transOperation);
		
		function transOperation(_point){
			MapObject.currentBMapX = _point.lng;
			MapObject.currentBMapY = _point.lat;
			MapObject.isLocateSuccess = true;
			if(!MapObject.isQuiet){
				var icon = new BMap.Icon("resources/css/images/location.png",new BMap.Size(16, 16))
				MapObject.currentLocOverlay = new BMap.Marker(_point,{icon:icon});
				MapObject.bmap.addOverlay(MapObject.currentLocOverlay);
				MapObject.currentLocAccuracyOverlay = new BMap.Circle(_point,MapObject.accuracy,{strokeWeight:1,fillColor:"#F0F8FF",fillOpacity:0.4});
				MapObject.bmap.addOverlay(MapObject.currentLocAccuracyOverlay);
				MapObject.bmap.centerAndZoom(_point, 18);
			}
			MapObject.setStatus('当前位置：&nbsp&nbsp经度:'+MapObject.currentGPSX+',&nbsp&nbsp纬度:'+MapObject.currentGPSY);
		}
	},
	
	locateError: function(_error){
		if(_error.code == 3){
//			UtilFunc.msgAlert('提示', 'code: ' + _error.code + '\n' + 'message: ' + _error.message + '\n');
			UtilFunc.msgAlert('提示', '定位超时，请稍候再试');
		}
		
		MapObject.isError = true;
		MapObject.isLocateSuccess = false;
		MapObject.currentGPSX = null; 
		MapObject.currentGPSY = null;
		MapObject.currentBMapX = null;
		MapObject.currentBMapY = null;
		MapObject.setStatus('定位失败!');
	}
	//==========================
}