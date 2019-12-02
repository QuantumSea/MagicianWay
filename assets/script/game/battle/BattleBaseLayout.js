
cc.Class({
    extends: Engine.GameBaseWindow,

    properties: {
        btnUpdate: cc.Button,
        btnFire: cc.Button,
    },

    onLoad () {
        this._super();

        this.a = {};
        this.a["item1"] = {0:"是我"};
        this.a["item2"] = {0:"是你"};

        this.init()
    },
 
    init () {
        Engine.GameLogs.log( String( Game.Data.Player.checkPoint ) );
        this.btnFire.node.on( cc.Node.EventType.TOUCH_START, this.btnFireGridsBeginCb.bind( this ));
        this.btnFire.node.on( cc.Node.EventType.TOUCH_MOVE, this.btnFireGridsMoveCb.bind( this ));
        this.btnFire.node.on( cc.Node.EventType.TOUCH_END, this.btnFireGridsEndCb.bind( this ));
        this.btnFire.node.on( cc.Node.EventType.TOUCH_CANCEL, this.btnFireGridsCancelCb.bind( this ));
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

btnBulletCbLv1: function (event, eventData) {

    this.node.emit(eventData, 0);

    this.btn3.onDisable();

    this.node.runAction( cc.sequence(
        cc.delayTime(1),
        cc.callFunc((node) => {
            this.btn3.onEnable();
        })
    ) );
},

btnBulletCbLv2: function (event, eventData) {

    this.node.emit(eventData, 0);

    this.btn4.onDisable();

    this.node.runAction( cc.sequence(
        cc.delayTime(1),
        cc.callFunc((node) => {
            this.btn4.onEnable();
        })
    ) );
},

btnBulletCbLv3: function (event, eventData) {

    this.node.emit(eventData, 0);

    this.btn5.onDisable();

    this.node.runAction( cc.sequence(
        cc.delayTime(1),
        cc.callFunc((node) => {
            this.btn5.onEnable();
        })
    ) );
}

});
