
cc.Class({
    extends: Engine.GameBaseWindow,

    properties: {
        btnListView: cc.Button,
    },

    onLoad () {
        this._super();
    },

    start () {

    },

/**
 * 逻辑代码
 * @param
 */
loadCall: function ( error, data ) {

    if( error ) {
        console.log( '載入Prefab失敗, 原因:' + error );
        return;
    }

    var showPrefab = cc.instantiate( data );
    cc.director.getScene().addChild(showPrefab);
},

btnCallBack: function (event, eventData) {

    if(eventData == "btnListView"){
        console.log( "Show ListView" )
        cc.loader.loadRes( 'prefab/window/TestLayout', this.loadCall );
    }

},

});
