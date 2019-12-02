
cc.Class({
    extends: cc.Component,

    properties: {
        itemNode: cc.Node,
        itemKey: {
            default: "default",
            tooltip: "技能Key值",
        },
        angle: 0,
    },
    
    ctor: function () {
        this.jumpState = 0;
        this.dmg = 0;
    },

    onLoad: function  () {
        this.behaviorComp = this.node.getComponent("CircleComponent");
        this.collider = this.node.getComponent(cc.BoxCollider);
        let act = cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc((node) => {
                this.node.destroy();
            })
        );
        act.setTag(99);
        this.node.runAction( act );

        if (this.itemNode) {
            let spAct = cc.moveTo(0.1, cc.v2(0,25));
            this.itemNode.runAction( spAct );
        }
    },

    initData: function ( skillData ) {
        this.dmg = skillData["shanghai"];
    },

    /**
     * 逻辑代码
     * @param setGroup 设置技能分组
     */
    setGroup: function ( groupStr ) {
        this.node.group = groupStr;
    },

    setSkillSpriteFrame: function ( data ) {
        this.itemNode.getComponent(cc.Sprite).spriteFrame = data;
    },

    play: function () {
        if (this.itemNode) {
            let act = cc.moveTo(3, cc.v2(0,0));
            this.itemNode.runAction( act );
        }
    },

});
