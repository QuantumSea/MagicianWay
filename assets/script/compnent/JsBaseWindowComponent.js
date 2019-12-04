
var stopPropagation = true;

cc.Class({
    extends: cc.Component,

    properties: {
        isStopPropagation: {
            default: true,
            tooltip: "是否拦截传递触摸操作,默认true(拦截)"
        },
        windowKeys: {
            default: "",
            tooltip: "设置window的key值(如存在prefab,则与prefab文件同名)"
        },
        touchEventNode: {
            default: null,
            type: cc.Node,
            tooltip: "设置接收触摸事件的节点"
        },
    },
    
    ctor: function () {
        this.setStopPropagation(true);
    },

    onLoad: function  () {
        this.setStopPropagation(this.isStopPropagation);
        Engine.GameLogs.log("------------------------");
        Engine.GameLogs.log("   |       |       |   ");
        Engine.GameLogs.log("Windows Load : " + this.windowKeys);
        Engine.GameLogs.log("Windows isStopPropagation : " + this.isStopPropagation);

        if(this.touchEventNode)
        {
            this.onTouchsEvent(this.touchEventNode);
            Engine.GameLogs.log("Windows touchEventNode : " + "true");
        }

        Engine.GameLogs.log("   |       |       |   ");
        Engine.GameLogs.log("------------------------");
    },

    init: function () {
    },

    windowDestroy: function () {
        this.node.destroy();
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
},

onTouchsMove: function (event) {
},

onTouchsEnd: function (event) {
},

onTouchsCancel: function (event) {
},
});
