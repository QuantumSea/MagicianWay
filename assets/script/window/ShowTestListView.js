
cc.Class({
    extends: cc.Component,
    properties: {
        btnClose: cc.Button,
        jsListView:{
            type:cc.ScrollView,
            default:null,
        },
    },

    onLoad () {
        this.onTouchsEvent(this.node);
        
        let self = this;
        this.itemAtlas = null;
        cc.loader.loadRes('Image/slot/symbol', cc.SpriteAtlas, function (err, atlas) {
            if(err){
                console.log( 'load res error' )
                return;
            }
            self.itemAtlas = atlas;
            if ( self.jsListView.getComponent("JsListViewComponent").enabled == true ) {
                let listData = {
                    updateItemCb: self.onUpdateItem,
                    itemAtlas: self.itemAtlas,
                }
                self.jsListView.getComponent("JsListViewComponent").onSetCmd( listData )
                self.jsListView.getComponent("JsListViewComponent").onDologic()
            }
        });
    },

    onUpdateItem( cellitemAtlas, cellitem, cellIdx ) {
        cellitem.getChildByName('nameLb').getComponent(cc.Label).string = '憨憨' + cellIdx + '号';
        cellitem.getChildByName('infoLb').getComponent(cc.Label).string = '这人是个憨憨' + cellIdx + '号';
        if (cellitem.getChildByName('headnode')) {
            if (cellitem.getChildByName('headnode').getChildByName('Icon')) {
                cellitem.getChildByName('headnode').getChildByName('Icon').getComponent(cc.Sprite).spriteFrame = cellitemAtlas.getSpriteFrame('s_'+(cellIdx%8+1));
            }
        }
    },

    btnCallBack: function (event, eventData) {

        if(eventData == "Close"){
            console.log( "Close" )
            this.node.destroy();
        }

    },

    start () {

    },

    onTouchsEvent: function (node) {

        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            // this.onTouchsStart(event);
            event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            // this.onTouchsMove(event);
            event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            // this.onTouchsEnd(event);
                event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            // this.onTouchsCancel(event);
                event.stopPropagation();
        }.bind(this), node);

    },

    // update (dt) {
        
    // },
});
