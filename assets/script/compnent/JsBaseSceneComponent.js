
cc.Class({
    extends: cc.Component,

    properties: {
        sceneKeys: "DefaultScene",
    },
    
    ctor: function () {
        this.init();
    },

    onLoad: function  () {
        Engine.GameLogs.log( "Extend JsBaseSceneComponent" );
    },

    init: function () {
    },

});
