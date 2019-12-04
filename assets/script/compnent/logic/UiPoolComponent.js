
cc.Class({
    extends: cc.Component,

    properties: {

    },
    
    ctor: function () {
        this.uiPool = cc.js.createMap();
        this.uiZOrder = Engine.GameDef.UIBaseZOrder;
    },

    onLoad: function  () {

    },

    pushUI: function( uiObj ) {
        var key = uiObj.getComponent(cc.Component).windowKeys;
        this.uiPool[key] = uiObj;
        this.node.addChild( uiObj, this.uiZOrder, key );
        this.uiZOrder = this.uiZOrder + 1;
    },

    popUI: function( key ) {
        if (this.uiPool[key]) {
            this.uiPool[key].getComponent(cc.Component).windowDestroy();
            delete this.uiPool[key];
        }
    }

});
