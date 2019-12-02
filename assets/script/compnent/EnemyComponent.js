
cc.Class({
    extends: require("RoleComponent"),

    properties: {

    },
    
    ctor: function () {

    },

    onLoad: function  () {
        this._super();
        this.aiExcute();
    },

    initData: function ( monsterData, monsterId, monsterIdx ) {
        this.hp = monsterData["HP"];
        this.maxHp = monsterData["HP"];
        this.dmg = monsterData["damage"];
        this.aiId = monsterData["AI"];
        this.monsterId = monsterId;
        this.monsterIdx = monsterIdx;
    },

/**
 * 逻辑代码
 * @param aiExcute ai执行
 */

    aiExcute: function() {
        var aiData = DB.getTableDataForKey( DB.AiVo, this.aiId );
        var aiAct = aiData["action"];       // 0:普通攻击 1/2/3:怪物表技能1/2/3
        var aiExcuteRate = aiData["time"];  // 攻击间隔时间（攻击频率）

        var delay = cc.delayTime( Number(aiExcuteRate) );
        var excuteCb = cc.callFunc((node) => {
            if (Number(aiAct) == 0) {
                this.node.dispatchEvent( new cc.Event.EventCustom('EnemyAttackCb', true) );
                this.attack();
            }
        });
        var seq = cc.sequence( delay, excuteCb );
        this.node.runAction( cc.repeatForever( seq ) );
    }
});
