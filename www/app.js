
Ext.application({
    name: 'GPSTest',
	
    controllers: ['MapController'],
    views: ['MapView'],
    
    phoneStartupScreen: 'resources/loading/Homescreen.jpg',
    tabletStartupScreen: 'resources/loading/Homescreen~ipad.jpg',
    
    launch: function(){
    	Ext.Viewport.add(Ext.create('GPSTest.view.MapView'));
    }
});
