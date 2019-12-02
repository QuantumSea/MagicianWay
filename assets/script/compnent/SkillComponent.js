
cc.Class({
    extends: cc.Component,

    properties: {
        roleAniNode: sp.Skeleton,
        roleKey: {
            default: "default",
            tooltip: "技能Key值",
        },
        angle: 0,
    },
    
    ctor: function () {
        this.jumpState = 0;
    },

    onLoad: function  () {
        this.behaviorComp = this.node.getComponent("CircleComponent");
        let act = cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc((node) => {
                this.node.destroy();
            })
        );
        act.setTag(99);
        this.node.runAction( act );
    },

    init: function () {

    },

    /**
     * 逻辑代码
     * @param setGroup 设置技能分组
     */
    setGroup: function ( groupStr ) {
        this.node.group = groupStr;
    },

    setAnimation: function ( data ) {
        this.roleAniNode.skeletonData = data;
    },

    play: function () {
        if (this.roleAniNode) {
            this.roleAniNode.setAnimation( 0, "animation", false )
        }
    },

    setAniAngle: function ( angle ) {
        this.roleAniNode.angle = angle;
    },

    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
        // console.log('on collision enter');

        // 碰撞系统会计算出碰撞组件在世界坐标系下的相关的值，并放到 world 这个属性里面
        var world = self.world;

        // 碰撞组件的 aabb 碰撞框
        var aabb = world.aabb;

        // 节点碰撞前上一帧 aabb 碰撞框的位置
        var preAabb = world.preAabb;

        // 碰撞框的世界矩阵
        var t = world.transform;

        // 以下属性为圆形碰撞组件特有属性
        var r = world.radius;
        var p = world.position;

        // 以下属性为 矩形 和 多边形 碰撞组件特有属性
        var ps = world.points;

        this.node.stopActionByTag(99);
        this.node.runAction( cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc((node) => {
                this.node.destroy();
            })
        ) );
    },

    /**
     * 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionStay: function (other, self) {
        // console.log('on collision stay');
    },

    /**
     * 当碰撞结束后调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionExit: function (other, self) {
        // console.log('on collision exit');
    }

});
