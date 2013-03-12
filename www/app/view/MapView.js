Ext.define('GPSTest.view.MapView', {
	extend : 'Ext.Container',
	xtype : 'mapview',
	config : {
		fullscreen : true,
		layout : 'fit',
		items : [{
					xtype : 'titlebar',
					docked : 'top',
					ui : 'dark',
					title : '<p>GPS测试程序</p>',
					items : [{
								id: 'uploadBtn',
								iconCls : 'sync_upload',
								iconMask : true,
								align : 'right'
							}]
				}, {
					xtype : 'panel',
					layout : 'fit',
					items : [{
								xtype : 'panel',
								id : 'mapContainer',
								html : '<div id="mapDiv" class="mapContainer"></div>'
										+ '<div class="zoomWidget">'
										+ '<div id="zoominBtnDiv"></div><div id="zoomoutBtnDiv"></div>'
										+ '</div>'
										+ '<div class="locateWidget">'
										+ '<div id="locateBtnDiv"></div>'
										+ '</div>'
							}]
				}, {
					xtype : 'toolbar',
					docked : 'bottom',
					height : 30,
					ui : 'dark',
					items : [{
						xtype : 'label',
						id: 'mapStatusBar',
						margin : '5 20 5 20',
						cls : 'statusBar'
//						html : '当前位置：&nbsp&nbsp经度:121.4637,&nbsp&nbsp纬度:31.2312'
					}]
				}]
	}
})