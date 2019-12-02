
cc.Class({
    extends: cc.Component,

    properties: {

    },
    
    ctor: function () {

    },

    onLoad: function  () {

    },

    init: function () {

    },

    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    onCollisionEnter: function (other, self) {
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

        var playerBody;
        var skillBody;

        if (other.node.group == "arr_enemy") {
            playerBody = other;
            skillBody = self;
        } else if (other.node.group == "arr_skill") {
            playerBody = self;
            skillBody = other;
        }

        if (playerBody.enabled == false) {
            Engine.GameLogs.log( "敌人只进行一次碰撞" );
            return
        }

        if (skillBody.enabled == false) {
            Engine.GameLogs.log( "技能只进行一次碰撞" );
            return
        }

        //角色碰撞逻辑
        var dmg = skillBody.node.getComponent("SkillItemComponent").dmg;
        playerBody.node.getComponent("RoleComponent").getHit( dmg );
        playerBody.node.dispatchEvent( new cc.Event.EventCustom('ShakeCb', true) );

        /*if (playerBody.node.getComponent("RoleComponent").hp <= 0) {
            playerBody.enabled = false;
            playerBody.node.removeComponent(cc.PolygonCollider);
            playerBody.node.getComponent("RoleComponent").idle();
            if (playerBody.node.getComponent("CircleComponent")) {
                playerBody.node.getComponent("CircleComponent").isExcute = false;
            }
            playerBody.node.runAction( cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc((node) => {
                    node.getComponent("RoleComponent").lifeState = false;
                    node.stopAllActions();
                    node.dispatchEvent( new cc.Event.EventCustom('EnemyDeathCb', true) );
                })
            ) );
        }*/

        //技能碰撞逻辑
        skillBody.node.removeComponent(cc.BoxCollider);
        skillBody.node.stopActionByTag(99);
        skillBody.node.runAction( cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc((node) => {
                node.destroy();
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
