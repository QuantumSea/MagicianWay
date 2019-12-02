
cc.Class({
    extends: cc.Component,

    properties: {
    },
    
    ctor: function () {
        this.state = 0;
    },

    onLoad: function  () {
        this.roleAniNode = this.node.getChildByName("spineNode").getComponent(sp.Skeleton);
        this.roleCircleComponent = this.node.getComponent("CircleComponent");
    },

    init: function () {
    },

/**
 * 逻辑代码
 * @param Excute 执行技能逻辑
 */
    Excute: function () {
        if (this.state == 1) {
            Engine.GameLogs.log("SpeedUpComponent Excuteing!");
            return;
        }
        Engine.GameLogs.log("SpeedUpComponent ExcuteNode!");
        if (this.roleAniNode) {
            this.roleAniNode.timeScale = this.roleAniNode.timeScale * 2;
        }
        if (this.roleCircleComponent) {
            this.roleCircleComponent.step = this.roleCircleComponent.step * 2;
        }

        this.state = 1

        this.node.runAction( cc.sequence(
            cc.delayTime(1),
            cc.callFunc((node) => {
                if (this.roleAniNode) {
                    this.roleAniNode.timeScale = this.roleAniNode.timeScale * 0.5;
                }
                if (this.roleCircleComponent) {
                    this.roleCircleComponent.step = 2 * 0.5;
                }
                this.state = 0;
            })
        ) );
    },
});
