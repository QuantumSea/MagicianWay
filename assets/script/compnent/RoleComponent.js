
cc.Class({
    extends: cc.Component,

    properties: {
        roleAniNode: sp.Skeleton,
        roleKey: {
            default: "default",
            tooltip: "角色Key值",
        },
        dmgPrefab:{
            type:cc.Prefab,
            default:null,
            tooltip: "伤害数字",
        },
    },
    
    ctor: function () {
        this.jumpState = 0;
        this.hp = 0;
        this.speed = 1;
        this.lifeState = true;
        this.initDmgFontPosY = 300;
        this.dmgFontList = [];
    },

    onLoad: function  () {
        this.behaviorComp = this.node.getComponent("CircleComponent");
        this.behaviorComp.step = this.speed;
        this.collider = this.node.getComponent(cc.PolygonCollider);
        this.progressBar = this.node.getChildByName('hpProgressBar').getComponent(cc.ProgressBar);
        this.progressBar.progress = this.hp/this.maxHp;
    },

    initData: function ( roleData ) {
        this.hp = roleData["HP"];
        this.maxHp = roleData["HP"];
        this.speed = roleData["speed"];
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

    death: function () {
        if (this.roleAniNode) {
            this.roleAniNode.setAnimation( 0, "die2", true );
        } 
    },

    hit: function () {
        // if (this.roleAniNode) {
        //     this.roleAniNode.setAnimation( 0, "die1", false );
        //     this.roleAniNode.addAnimation( 0, "idle", true );
        // }   
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
        var dmgFont = cc.instantiate( this.dmgPrefab );
        dmgFont.setPosition( cc.v2( 0, this.initDmgFontPosY ) );
        dmgFont.getComponent(cc.Label).string = "-" + num;
        var scaleTo = cc.scaleTo(0.1, 1.2, 1.2);
        var scaleTo1 = cc.scaleTo(0.1, 1.0, 1.0);
        dmgFont.runAction( cc.sequence( scaleTo, scaleTo1, cc.delayTime(0.5), cc.callFunc((prefabNode) => {
            prefabNode.destroy();
        }) ) )
        this.node.addChild( dmgFont );
        this.dmgFontList.push( dmgFont );
        if (this.dmgFontList.length >= 2) {
            this.dmgFontList.forEach((obj, idx) => {
                if (idx < this.dmgFontList.length - 1 ) {
                    if (cc.isValid(obj)==true) {
                        obj.y = this.initDmgFontPosY + 80*(this.dmgFontList.length-1-idx);
                    } else {
                        this.dmgFontList.splice(idx,1)
                    }
                }
            });
        }
    },

    getHit: function ( num ) {
        this.hit();
        this.hp = this.hp - num;
        this.progressBar.progress = this.hp/this.maxHp;
        this.hpChange( num );
    },
});
