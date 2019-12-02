
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
        this.playerId = playerId;
        this.playerIdx = playerIdx;
    },

});
