var stopPropagation = true;

cc.Class({
    extends: cc.Component,

    properties: {
        bgSprite: {
            default: null,
            type: cc.Sprite,
            tooltip: "格子底图",
        },
        gridSprite: {
            default: null,
            type: cc.Sprite,
            tooltip: "格子内容",
        },
        qualitySprite: {
            default: null,
            type: cc.Sprite,
            tooltip: "格子品质",
        },
        touchEventNode: {
            default: null,
            type: cc.Node,
            tooltip: "设置接收触摸事件的节点"
        },
    },
    
    ctor: function () {
        this.setStopPropagation(true);
        this.gridLockState = false;
    },

    onLoad: function  () {
        this.location = this.node.position;
        if(this.touchEventNode)
        {
            this.onTouchsEvent(this.touchEventNode);
        }
    },

    init: function () {
        
    },

    onDes: function () {
        Engine.GameLogs.log( "Grid " + this.gridIdx + " Clear"  );
        this.node.destroy();
    },

/**
 * 逻辑代码
 * @param setSpriteFrame 更改格子spriteframe
 * @param setQualityFrame 更改格子spriteframe
 * @param backPoint 回到格子起始点
 * @param goTargetPoint 去目标点
 */

    setCmd: function ( cmdData ) {
        this.gridIdx = cmdData.gridIdx;
        this.gridState = cmdData.gridState;
        this.gridItemIdx = cmdData.gridItemIdx;
        this.gridItemLvIdx = cmdData.gridItemLvIdx;
        this.gridItemId = cmdData.gridItemId;
        this.gridLockState = cmdData.gridLockState;
        this.parentNode = cmdData.parentNode;
    },

    setSpriteFrame: function ( spFrame ) {
        this.gridSprite.spriteFrame = spFrame;
    },

    setQualityFrame: function ( spFrame ) {
        this.qualitySprite.spriteFrame = spFrame;
    },

    backPoint: function () {
        this.node.setPosition( this.location );
    },

/**
 * 逻辑代码
 * @param setStopPropagation 设置事件拦截状态
 */
    setStopPropagation: function (stop) {
        stopPropagation = stop;
    },

    onTouchsEvent: function (node) {

        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.onTouchsStart(event);
            if(stopPropagation)
                event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.onTouchsMove(event);
            if(stopPropagation)
                event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onTouchsEnd(event);
            if(stopPropagation)
                event.stopPropagation();
        }.bind(this), node);
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.onTouchsCancel(event);
            if(stopPropagation)
                event.stopPropagation();
        }.bind(this), node);

    },

    /**
    * @param onTouchsStart Touchs事件 开始回调
    * @param onTouchsMove Touchs事件 移动回调
    * @param onTouchsEnd Touchs事件 结束回调
    * @param onTouchsCancel Touchs事件 失效回调
    */
    onTouchsStart: function (event) {
        this.node.zIndex = this.node.zIndex + 100;
        // var touch = event.touch;
        // this.node.setPosition( touch.getLocation() );
        // Engine.GameLogs.log( String(touch.getLocation().y) );
    },

    onTouchsMove: function (event) {
        var touch = event.touch;
        this.node.setPosition( touch.getLocation() );  
    },

    onTouchsEnd: function (event) {
        let diffX = this.node.position.x - this.location.x;
        let diffY = this.node.position.y - this.location.y
        let xAbs = diffX > 0?1:-1;
        let yAbs = diffY > 0?1:-1;
        let xOffset = Math.ceil( Math.floor( Math.abs( diffX/(this.node.width*0.5) ) ) * 0.5 ) * xAbs;
        let yOffset = Math.ceil( Math.floor( Math.abs( diffY/(this.node.height*0.5) ) ) * 0.5 ) * yAbs;

        let targetIndex = this.gridIdx + xOffset - ( yOffset * 5 );

        if (targetIndex == this.gridIdx) {
            Engine.GameLogs.log( "位置没有发生变化 gridIndex = " + targetIndex );
            this.node.setPosition( this.location );
        } else {
            this.parentNode.emit('checkComponseCb', this.gridIdx, targetIndex);
        }
        
        this.node.zIndex = this.node.zIndex - 100;
    },

    onTouchsCancel: function (event) {
        this.node.zIndex = this.node.zIndex - 100;
        this.node.setPosition( this.location );
    },
});
