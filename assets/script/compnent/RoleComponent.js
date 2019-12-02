
cc.Class({
    extends: cc.Component,

    properties: {
        roleAniNode: sp.Skeleton,
        roleKey: {
            default: "default",
            tooltip: "角色Key值",
        },
    },
    
    ctor: function () {
        this.jumpState = 0;
        this.hp = 0;
        this.speed = 1;
        this.lifeState = true;
    },

    onLoad: function  () {
        this.behaviorComp = this.node.getComponent("CircleComponent");
        this.collider = this.node.getComponent(cc.PolygonCollider);
        this.progressBar = this.node.getChildByName('hpProgressBar').getComponent(cc.ProgressBar);
        this.progressBar.progress = this.hp/this.maxHp;
    },

    initData: function ( roleData ) {
        this.hp = roleData["HP"];
        this.maxHp = roleData["HP"];
    },

/**
 * 逻辑代码
 * @param setGroup 设置角色分组
 * @param run 角色跑动
 * @param jump 角色跳跃
 */
    setGroup: function ( groupStr ) {
        this.node.group = groupStr;
    },

    setAnimation: function ( data ) {
        this.roleAniNode.skeletonData = data;
    },

    setSkin: function ( skinName ) {
        this.roleAniNode.defaultSkin = skinName;
    },

    idle: function () {
        if (this.roleAniNode) {
            this.roleAniNode.setAnimation( 0, "idle", true )
        }
    },

    run: function () {
        if (this.roleAniNode) {
            this.roleAniNode.setAnimation( 0, "run", true )
        }
    },

    attack: function () {
        if (this.roleAniNode) {
            this.roleAniNode.setAnimation( 0, "run_attack", false );
            this.roleAniNode.addAnimation( 0, "run", true );
        } 
    },

    jump: function () {
        if (this.jumpState == 1) {
            Engine.GameLogs.log("Jumping!");
            return;
        }
        if (this.behaviorComp) {
            this.behaviorComp.jump();
        }
    },

    hpChange: function ( num ) {
        var lbNode = new cc.Node();
        lbNode.setPosition( cc.v2( -84,259 ) );
        lbNode.addComponent(cc.Label);
        lbNode.getComponent(cc.Label).string = "-" + num;
        lbNode.getComponent(cc.Label).fontSize = 60;
        lbNode.getComponent(cc.Label).lineHeight = 60;
        lbNode.color = new cc.color(236,65,14);

        this.node.addChild( lbNode );

        var delayStart = cc.delayTime(0.1);
        var scaleTo = cc.scaleTo(0.1, 1.0, 1.0);
        var scaleTo1 = cc.scaleTo(0.1, 1.0, 1.0);
        var dCallFunc = cc.callFunc((lbNode) => {
                    lbNode.destroy();
                });
        var scaleSeq = cc.sequence( delayStart, scaleTo, scaleTo1, cc.fadeTo(1), dCallFunc );
        var moveUp = cc.moveTo(0.5, cc.v2( -114, 309));
        var spawn = cc.spawn(moveUp, scaleSeq);
        lbNode.runAction( spawn );
    },

    getHit: function ( num ) {
        this.hp = this.hp - num;
        this.progressBar.progress = this.hp/this.maxHp;
        this.hpChange( num );
    }

});
