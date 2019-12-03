
cc.Class({
    extends: require("RoleComponent"),

    properties: {

    },
    
    ctor: function () {

    },

    onLoad: function  () {
        this._super();
    },

    initData: function ( playerData, playerId, playerIdx ) {
        this.hp = playerData["HP"];
        this.maxHp = playerData["HP"];
        this.speed = playerData["speed"];
        this.playerId = playerId;
        this.playerIdx = playerIdx;
    },

    getHit: function ( num ) {
        this._super( num );
        if (this.hp <= 0) {
            this.node.removeComponent(cc.PolygonCollider);
            this.death();
            if (this.node.getComponent("CircleComponent")) {
                this.node.getComponent("CircleComponent").isExcute = false;
            }
            this.node.runAction( cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc((node) => {
                    this.lifeState = false;
                    node.stopAllActions();
                    node.dispatchEvent( new cc.Event.EventCustom('PlayerDeathCb', true) );
                })
            ) );
        }
    }

});
