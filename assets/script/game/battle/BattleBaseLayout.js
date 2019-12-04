
cc.Class({
    extends: Engine.GameBaseWindow,

    properties: {
        btnUpdate: cc.Button,
        btnFire: cc.Button,
        btnBegin: cc.Button,
    },

    onLoad () {
        this._super();
        this.init()
    },
 
    init () {
        Engine.GameLogs.log( String( Game.Data.Player.checkPoint ) );
        this.btnFire.node.on( cc.Node.EventType.TOUCH_START, this.btnFireGridsBeginCb.bind( this ));
        this.btnFire.node.on( cc.Node.EventType.TOUCH_MOVE, this.btnFireGridsMoveCb.bind( this ));
        this.btnFire.node.on( cc.Node.EventType.TOUCH_END, this.btnFireGridsEndCb.bind( this ));
        this.btnFire.node.on( cc.Node.EventType.TOUCH_CANCEL, this.btnFireGridsCancelCb.bind( this ));

        this.node.on('GuanQiaRefresh', function ( event ) {
            event.stopPropagation();
            this.btnBegin.node.opacity = 255;
            this.btnBegin.onEnable();
        }, this);
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

    if(eventData == "btnSpeedUp"){
        this.node.emit("btnSkillSpeedUp", 0);
    }

},

btnUpdateGridsCb: function (event, eventData) {

    if(eventData == "btnUpdateGridsCb"){
        this.node.emit("btnUpdateGridsCb");
    }
    this.btnUpdate.onDisable();

    this.node.runAction( cc.sequence(
        cc.delayTime(3),
        cc.callFunc((node) => {
            this.btnUpdate.onEnable();
        })
    ) );
},

btnFireGridsCb: function (event, eventData) {
    if(eventData == "btnFireGridsCb"){
        this.node.emit("btnFireGridsCb");
    }
},

btnGameBeginCb: function (event, eventData) {
    this.btnBegin.node.opacity = 0;
    this.btnBegin.onDisable();
    this.node.emit("btnGameBeginCb");
},

btnFireGridsBeginCb: function (event, eventData) {
    this.node.emit("btnFireGridsBeginCb");
},

btnFireGridsMoveCb: function (event, eventData) {
    this.node.emit("btnFireGridsMoveCb");
},

btnFireGridsEndCb: function (event, eventData) {
    this.node.emit("btnFireGridsEndCb");
},

btnFireGridsCancelCb: function (event, eventData) {
    this.node.emit("btnFireGridsCancelCb");
},

btnFireCircleCb: function (event, eventData) {

    if(eventData == "btnFireCircleCb"){
        this.node.emit("btnSkillFireCircle", 0);
    }
    this.btn2.onDisable();

    this.node.runAction( cc.sequence(
        cc.delayTime(1),
        cc.callFunc((node) => {
            this.btn2.onEnable();
        })
    ) );
},

});
