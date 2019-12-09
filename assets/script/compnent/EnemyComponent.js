
var AIACTTAG = 1000

cc.Class({
    extends: require("RoleComponent"),

    properties: {

    },
    
    ctor: function () {

    },

    onLoad: function  () {
        this._super();
        this.aiExcuteNode = new cc.Node;
        this.node.addChild( this.aiExcuteNode );
        this.aiExcute();
    },

    initData: function ( monsterData, monsterId, monsterIdx ) {
        this.hp = monsterData["HP"];
        this.maxHp = monsterData["HP"];
        this.dmg = monsterData["damage"];
        this.aiId = monsterData["AI"];
        this.speed = monsterData["speed"];
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
        seq.setTag( AIACTTAG )
        this.aiExcuteNode.runAction( cc.repeatForever( seq ) );
        this.aiPause();
    },

    aiPause: function() {
        cc.director.getActionManager().pauseTarget( this.aiExcuteNode );
    },

    aiResume: function() {
        cc.director.getActionManager().resumeTarget( this.aiExcuteNode );
    },

    getHit: function ( num ) {
        this._super( num );
        if (this.hp <= 0) {
            this.node.removeComponent(cc.PolygonCollider);
            this.death();
            this.aiPause();
            if (this.node.getComponent("CircleComponent")) {
                this.node.getComponent("CircleComponent").isExcute = false;
            }
            this.node.runAction( cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc((node) => {
                    this.lifeState = false;
                    node.stopAllActions();
                    node.dispatchEvent( new cc.Event.EventCustom('EnemyDeathCb', true) );
                })
            ) );
        }
    }
});
